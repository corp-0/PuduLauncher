import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from "react";
import TtsInstallerLayout from "../components/layouts/tts/TtsInstallerLayout";
import { TTS_STATUS, TTS_STATUS_LABELS } from "../constants/ttsStatus";
import { EventListener } from "../pudu/events/event-listener";
import { TtsApi, type TtsState } from "../pudu/generated";
import { useErrorContext } from "./ErrorContextProvider";

interface TtsInstallerContextValue {
    isInstallerOpen: boolean;
    closeInstaller: () => void;
}

const TtsInstallerContext = createContext<TtsInstallerContextValue | undefined>(undefined);

const INSTALL_SESSION_START_STATUSES = new Set<number>([
    TTS_STATUS.Downloading,
    TTS_STATUS.Installing,
]);

const INSTALL_SESSION_BUSY_STATUSES = new Set<number>([
    TTS_STATUS.CheckingForUpdates,
    TTS_STATUS.Downloading,
    TTS_STATUS.Installing,
]);

const INSTALL_STEPS = [
    { shortLabel: "Prepare", longLabel: "Preparing installer download", longRunning: false },
    { shortLabel: "Python", longLabel: "Installing Python portable", longRunning: false },
    { shortLabel: "Environment", longLabel: "Creating the Python environment", longRunning: false },
    { shortLabel: "Packages", longLabel: "Installing Python packages", longRunning: true },
    { shortLabel: "eSpeak-ng", longLabel: "Installing eSpeak-ng", longRunning: false },
    { shortLabel: "Model", longLabel: "Downloading the TTS model", longRunning: true },
    { shortLabel: "Server", longLabel: "Configuring the local server", longRunning: false },
] as const;

const INSTALL_STEP_LABELS = INSTALL_STEPS.map((step) => step.shortLabel);
const INSTALL_STEP_STATUS_MESSAGES = INSTALL_STEPS.map((step) => step.longLabel);
const INSTALL_SUCCESS_MESSAGE = "HonkTTS installation completed successfully.";
const INSTALL_LONG_RUNNING_STEPS = new Set<number>(
    INSTALL_STEPS.flatMap((step, index) => (step.longRunning ? [index + 1] : [])),
);
const INSTALL_OUTPUT_STEP_REGEX = /\[(\d+)\s*\/\s*6\]/i;

function inferStepFromLogLine(rawLine: string): number | null {
    const line = rawLine.toLowerCase();

    const fractionMatch = line.match(INSTALL_OUTPUT_STEP_REGEX);
    if (fractionMatch) {
        const numerator = Number(fractionMatch[1]);
        if (Number.isFinite(numerator)) {
            const visualStep = numerator + 1;
            return Math.min(Math.max(visualStep, 2), INSTALL_STEP_LABELS.length);
        }
    }

    if (line.includes("(python)")) {
        return 2;
    }

    if (line.includes("(venv)")) {
        return 3;
    }

    if (line.includes("(packages)")) {
        return 4;
    }

    if (line.includes("(espeak)")) {
        return 5;
    }

    if (line.includes("(warmup)")) {
        return 6;
    }

    if (line.includes("(server)")) {
        return 7;
    }

    return null;
}

function inferCurrentStep(status: number | null, installLogs: string[]): number {
    const stepFromLogs = installLogs.reduce((maxStep, line) => {
        const parsed = inferStepFromLogLine(line);
        if (parsed === null) {
            return maxStep;
        }

        return Math.max(maxStep, parsed);
    }, 0);

    let stepFromStatus = 1;
    switch (status) {
        case TTS_STATUS.CheckingForUpdates:
            stepFromStatus = 1;
            break;
        case TTS_STATUS.Downloading:
            stepFromStatus = 1;
            break;
        case TTS_STATUS.Installing:
            stepFromStatus = Math.max(stepFromLogs, 2);
            break;
        case TTS_STATUS.Installed:
            stepFromStatus = INSTALL_STEP_LABELS.length;
            break;
        case TTS_STATUS.Error:
            stepFromStatus = Math.max(stepFromLogs, 1);
            break;
        default:
            stepFromStatus = Math.max(stepFromLogs, 1);
            break;
    }

    return Math.min(Math.max(Math.max(stepFromLogs, stepFromStatus), 1), INSTALL_STEP_LABELS.length);
}

export function TtsInstallerContextProvider(props: PropsWithChildren) {
    const { children } = props;
    const { showError } = useErrorContext();

    const [ttsState, setTtsState] = useState<TtsState | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [installLogs, setInstallLogs] = useState<string[]>([]);
    const [isInstallerOpen, setIsInstallerOpen] = useState(false);
    const [maxReachedStep, setMaxReachedStep] = useState(1);
    const installSessionRef = useRef(false);

    const beginInstallSession = useCallback(() => {
        if (installSessionRef.current) {
            return;
        }

        installSessionRef.current = true;
        setInstallLogs([]);
        setStatusMessage(null);
        setMaxReachedStep(1);
    }, []);

    const loadStatus = useCallback(async () => {
        const api = new TtsApi();
        const result = await api.getStatus();

        if (!result.success || !result.data) {
            showError({
                source: "frontend.tts-installer.get-status",
                userMessage: "Failed to load installer status.",
                code: "TTS_INSTALLER_STATUS_FETCH_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
            });
            return;
        }

        setTtsState(result.data);

        if (INSTALL_SESSION_START_STATUSES.has(result.data.status)) {
            beginInstallSession();
            setIsInstallerOpen(true);
        }
    }, [beginInstallSession, showError]);

    useEffect(() => {
        let isDisposed = false;

        void (async () => {
            try {
                await loadStatus();
            } catch (error: unknown) {
                if (!isDisposed) {
                    showError({
                        source: "frontend.tts-installer.get-status",
                        userMessage: "Failed to load installer status.",
                        code: "TTS_INSTALLER_STATUS_FETCH_EXCEPTION",
                        technicalDetails: error instanceof Error ? error.toString() : String(error),
                    });
                }
            }
        })();

        const eventListener = new EventListener();

        eventListener.on("tts:status-changed", (event) => {
            if (isDisposed) {
                return;
            }

            if (INSTALL_SESSION_START_STATUSES.has(event.status)) {
                beginInstallSession();
                setIsInstallerOpen(true);
            }

            if (installSessionRef.current && (
                event.status === TTS_STATUS.Installed
                || event.status === TTS_STATUS.NotInstalled
                || event.status === TTS_STATUS.Error
            )) {
                setIsInstallerOpen(true);
            }

            setStatusMessage(event.message ?? null);
            setTtsState((previous) => {
                if (previous === null) {
                    return previous;
                }

                return {
                    ...previous,
                    status: event.status,
                    errorMessage: event.status === TTS_STATUS.Error
                        ? event.message ?? previous.errorMessage
                        : previous.errorMessage,
                };
            });

            void loadStatus();
        });

        eventListener.on("tts:install-output", (event) => {
            if (isDisposed) {
                return;
            }

            beginInstallSession();
            setIsInstallerOpen(true);
            setInstallLogs((previous) => {
                const next = [...previous, event.line];
                if (next.length <= 400) {
                    return next;
                }

                return next.slice(next.length - 400);
            });
        });

        return () => {
            isDisposed = true;
            eventListener.disconnect();
        };
    }, [beginInstallSession, loadStatus, showError]);

    const status = ttsState?.status ?? null;
    const isBusy = status !== null && INSTALL_SESSION_BUSY_STATUSES.has(status);

    const closeInstaller = () => {
        if (isBusy) {
            return;
        }

        setIsInstallerOpen(false);
        installSessionRef.current = false;
        setInstallLogs([]);
        setStatusMessage(null);
    };

    const value: TtsInstallerContextValue = {
        isInstallerOpen,
        closeInstaller,
    };

    const statusLabel = status !== null
        ? (TTS_STATUS_LABELS[status] ?? `Status ${status}`)
        : "Unknown";
    const inferredStep = inferCurrentStep(status, installLogs);

    useEffect(() => {
        setMaxReachedStep((previous) => Math.max(previous, inferredStep));
    }, [inferredStep]);

    const currentStep = maxReachedStep;
    const isInstallComplete = status === TTS_STATUS.Installed;
    const stepStatusMessage = isInstallComplete
        ? INSTALL_SUCCESS_MESSAGE
        : (INSTALL_STEP_STATUS_MESSAGES[currentStep - 1] ?? statusMessage ?? statusLabel);
    const longStepWarning = isBusy && INSTALL_LONG_RUNNING_STEPS.has(currentStep)
        ? "This step can take a few minutes. If it looks stuck, please wait. It's still working"
        : null;

    const canRenderModal = isInstallerOpen && installSessionRef.current;

    return (
        <TtsInstallerContext.Provider value={value}>
            {children}

            <TtsInstallerLayout
                open={canRenderModal}
                statusLabel={statusLabel}
                statusMessage={stepStatusMessage}
                errorMessage={ttsState?.errorMessage}
                installLogs={installLogs}
                isBusy={isBusy}
                currentStep={currentStep}
                stepLabels={INSTALL_STEP_LABELS}
                isComplete={isInstallComplete}
                longStepWarning={longStepWarning}
                onClose={closeInstaller}
            />
        </TtsInstallerContext.Provider>
    );
}

export function useTtsInstallerContext() {
    const context = useContext(TtsInstallerContext);
    if (context === undefined) {
        throw new Error("useTtsInstallerContext must be used within a TtsInstallerContextProvider.");
    }

    return context;
}
