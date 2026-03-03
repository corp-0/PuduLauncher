import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";
import { TTS_STATUS } from "../constants/ttsStatus";
import { EventListener } from "../pudu/events/event-listener";
import { TtsApi, type CommandResult, type TtsState } from "../pudu/generated";
import { useFeedbackContext } from "./FeedbackContextProvider";

type TtsCommand = {
    [K in keyof TtsApi]: TtsApi[K] extends () => Promise<CommandResult<void>> ? K : never;
}[keyof TtsApi];

const INSTALL_BUSY_STATUSES = new Set<number>([
    TTS_STATUS.CheckingForUpdates,
    TTS_STATUS.Downloading,
    TTS_STATUS.Installing,
    TTS_STATUS.ServerStarting,
]);

const INSTALLED_STATUSES = new Set<number>([
    TTS_STATUS.Installed,
    TTS_STATUS.ServerRunning,
    TTS_STATUS.ServerStopped,
    TTS_STATUS.ServerStarting,
]);

export interface TtsPreferencesContextValue {
    isLoadingState: boolean;
    status: number | null;
    statusMessage: string | null;
    errorMessage: string | null | undefined;
    isBusy: boolean;
    canStartServer: boolean;
    canStopServer: boolean;
    isInstalled: boolean;
    updateAvailable: boolean;
    latestVersion: string | null | undefined;
    runCommand: (command: TtsCommand) => Promise<void>;
}

const TtsPreferencesContext = createContext<TtsPreferencesContextValue | undefined>(undefined);

export function TtsPreferencesContextProvider(props: PropsWithChildren) {
    const { children } = props;
    const { showError } = useFeedbackContext();
    const [ttsState, setTtsState] = useState<TtsState | null>(null);
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [isRunningCommand, setIsRunningCommand] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [latestVersion, setLatestVersion] = useState<string | null>(null);

    const loadStatus = async () => {
        const api = new TtsApi();
        const result = await api.getStatus();
        if (!result.success || !result.data) {
            showError({
                source: "frontend.preferences.tts.get-status",
                userMessage: "Failed to load TTS status.",
                code: "TTS_STATUS_FETCH_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
            });
            return null;
        }

        setTtsState(result.data);
        return result.data;
    };

    useEffect(() => {
        let isDisposed = false;

        void (async () => {
            try {
                const state = await loadStatus();
                if (!isDisposed && state && INSTALLED_STATUSES.has(state.status)) {
                    const api = new TtsApi();
                    await api.checkForUpdates();
                }
            } catch (error: unknown) {
                if (!isDisposed) {
                    showError({
                        source: "frontend.preferences.tts.get-status",
                        userMessage: "Failed to load TTS status.",
                        code: "TTS_STATUS_FETCH_EXCEPTION",
                        technicalDetails: error instanceof Error ? error.toString() : String(error),
                    });
                }
            } finally {
                if (!isDisposed) {
                    setIsLoadingState(false);
                }
            }
        })();

        const eventListener = new EventListener();
        eventListener.on("tts:status-changed", (event) => {
            if (isDisposed) {
                return;
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

        eventListener.on("tts:update-available", (event) => {
            if (isDisposed) {
                return;
            }

            setUpdateAvailable(true);
            setLatestVersion(event.latestVersion);
        });

        return () => {
            isDisposed = true;
            eventListener.disconnect();
        };
    }, []);

    const runCommand = async (command: TtsCommand) => {
        if (isRunningCommand) {
            return;
        }

        setIsRunningCommand(true);
        const api = new TtsApi();
        const result = await api[command]();
        setIsRunningCommand(false);

        if (!result.success) {
            showError({
                source: `frontend.preferences.tts.${command}`,
                userMessage: "Failed to execute TTS action.",
                code: "TTS_COMMAND_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
            });
        }
    };

    const status = ttsState?.status ?? null;
    const isBusy = isRunningCommand || (status !== null && INSTALL_BUSY_STATUSES.has(status));
    const canStartServer = status === TTS_STATUS.Installed || status === TTS_STATUS.ServerStopped;
    const canStopServer = status === TTS_STATUS.ServerRunning || status === TTS_STATUS.ServerStarting;
    const isInstalled = status !== null && INSTALLED_STATUSES.has(status);

    const value: TtsPreferencesContextValue = {
        isLoadingState,
        status,
        statusMessage,
        errorMessage: ttsState?.errorMessage,
        isBusy,
        canStartServer,
        canStopServer,
        isInstalled,
        updateAvailable,
        latestVersion,
        runCommand,
    };

    return (
        <TtsPreferencesContext.Provider value={value}>
            {children}
        </TtsPreferencesContext.Provider>
    );
}

export function useTtsPreferencesContext() {
    const context = useContext(TtsPreferencesContext);
    if (context === undefined) {
        throw new Error("useTtsPreferencesContext must be used within a TtsPreferencesContextProvider.");
    }

    return context;
}

export interface TtsPreferencesTestProviderProps extends PropsWithChildren {
    value: TtsPreferencesContextValue;
}

export function TtsPreferencesTestProvider(props: TtsPreferencesTestProviderProps) {
    return (
        <TtsPreferencesContext.Provider value={props.value}>
            {props.children}
        </TtsPreferencesContext.Provider>
    );
}
