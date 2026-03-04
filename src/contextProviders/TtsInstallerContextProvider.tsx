import { createContext, type PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import TtsInstallerLayout from "../components/layouts/tts/TtsInstallerLayout";
import { TTS_INSTALL_SESSION_BUSY_STATUSES, TTS_INSTALL_SESSION_START_STATUSES, TTS_STATUS, TTS_STATUS_LABELS } from "../constants/ttsStatus";
import { useFeedbackContext } from "./FeedbackContextProvider";
import { useTtsState } from "./TtsStateContextProvider";

interface TtsInstallerContextValue {
    isInstallerOpen: boolean;
    closeInstaller: () => void;
}

const TtsInstallerContext = createContext<TtsInstallerContextValue | undefined>(undefined);

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

function stepFromStatus(status: number | null): number {
    switch (status) {
        case TTS_STATUS.Installed:
            return INSTALL_STEP_LABELS.length;
        case TTS_STATUS.Installing:
            return 2;
        default:
            return 1;
    }
}

export function TtsInstallerContextProvider(props: PropsWithChildren) {
    const { children } = props;
    const { showSuccess, showInfo } = useFeedbackContext();
    const { ttsState, status, statusMessage, installLogs, clearInstallLogs } = useTtsState();

    const [isInstallerOpen, setIsInstallerOpen] = useState(false);
    const [maxReachedStep, setMaxReachedStep] = useState(1);
    const installSessionRef = useRef(false);
    const prevStatusRef = useRef<number | null>(null);
    const prevLogLengthRef = useRef(0);
    const prevUpdateAvailableRef = useRef(false);

    const beginInstallSession = () => {
        if (installSessionRef.current) {
            return;
        }

        installSessionRef.current = true;
        clearInstallLogs();
        setMaxReachedStep(1);
    };

    // React to status changes
    useEffect(() => {
        if (status === null) {
            return;
        }

        if (TTS_INSTALL_SESSION_START_STATUSES.has(status)) {
            beginInstallSession();
            setIsInstallerOpen(true);
        }

        if (installSessionRef.current && (
            status === TTS_STATUS.Installed
            || status === TTS_STATUS.NotInstalled
            || status === TTS_STATUS.Error
        )) {
            setIsInstallerOpen(true);
        }

        if (status === TTS_STATUS.ServerRunning && prevStatusRef.current !== TTS_STATUS.ServerRunning) {
            showSuccess({ message: "TTS server is running" });
        }

        setMaxReachedStep((prev) => Math.max(prev, stepFromStatus(status)));
        prevStatusRef.current = status;
    }, [status]);

    // React to new install log lines
    useEffect(() => {
        if (installLogs.length > 0 && !installSessionRef.current) {
            beginInstallSession();
            setIsInstallerOpen(true);
        }

        for (let i = prevLogLengthRef.current; i < installLogs.length; i++) {
            const parsed = inferStepFromLogLine(installLogs[i]);
            if (parsed !== null) {
                setMaxReachedStep((prev) => Math.max(prev, parsed));
            }
        }

        prevLogLengthRef.current = installLogs.length;
    }, [installLogs]);

    useEffect(() => {
        const updateAvailable = ttsState?.updateAvailable ?? false;
        if (updateAvailable && !prevUpdateAvailableRef.current && ttsState) {
            showInfo({
                message: `HonkTTS update available: ${ttsState.latestVersion} (installed: ${ttsState.installedVersion})`,
            });
        }

        prevUpdateAvailableRef.current = updateAvailable;
    }, [ttsState?.updateAvailable]);

    const isBusy = status !== null && TTS_INSTALL_SESSION_BUSY_STATUSES.has(status);

    const closeInstaller = () => {
        if (isBusy) {
            return;
        }

        setIsInstallerOpen(false);
        installSessionRef.current = false;
        clearInstallLogs();
    };

    const value: TtsInstallerContextValue = {
        isInstallerOpen,
        closeInstaller,
    };

    const statusLabel = status !== null
        ? (TTS_STATUS_LABELS[status] ?? `Status ${status}`)
        : "Unknown";
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
                isComplete={isInstallComplete || currentStep >= INSTALL_STEP_LABELS.length}
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
