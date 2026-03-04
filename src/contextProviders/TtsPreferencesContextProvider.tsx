import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";
import { TTS_BUSY_STATUSES, TTS_INSTALLED_STATUSES, TTS_STATUS } from "../constants/ttsStatus";
import { TtsApi, type CommandResult } from "../pudu/generated";
import { useFeedbackContext } from "./FeedbackContextProvider";
import { useTtsState } from "./TtsStateContextProvider";

type TtsCommand = {
    [K in keyof TtsApi]: TtsApi[K] extends () => Promise<CommandResult<void>> ? K : never;
}[keyof TtsApi];

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
    const { ttsState, status, statusMessage, isLoadingState } = useTtsState();
    const [isRunningCommand, setIsRunningCommand] = useState(false);

    useEffect(() => {
        if (!isLoadingState && status !== null && TTS_INSTALLED_STATUSES.has(status)) {
            void new TtsApi().checkForUpdates();
        }
    }, [isLoadingState]);

    const runCommand = async (command: TtsCommand) => {
        if (isRunningCommand) {
            return;
        }

        setIsRunningCommand(true);
        try {
            const api = new TtsApi();
            const result = await api[command]();

            if (!result.success) {
                showError({
                    source: `frontend.preferences.tts.${command}`,
                    userMessage: "Failed to execute TTS action.",
                    code: "TTS_COMMAND_FAILED",
                    technicalDetails: result.error ?? "Unknown backend error.",
                });
            }
        } catch (error: unknown) {
            showError({
                source: `frontend.preferences.tts.${command}`,
                userMessage: "Failed to execute TTS action.",
                code: "TTS_COMMAND_EXCEPTION",
                technicalDetails: error instanceof Error ? error.toString() : String(error),
            });
        } finally {
            setIsRunningCommand(false);
        }
    };

    const isBusy = isRunningCommand || (status !== null && TTS_BUSY_STATUSES.has(status));
    const canStartServer = status === TTS_STATUS.Installed || status === TTS_STATUS.ServerStopped;
    const canStopServer = status === TTS_STATUS.ServerRunning || status === TTS_STATUS.ServerStarting;
    const isInstalled = status !== null && TTS_INSTALLED_STATUSES.has(status);

    const value: TtsPreferencesContextValue = {
        isLoadingState,
        status,
        statusMessage,
        errorMessage: ttsState?.errorMessage,
        isBusy,
        canStartServer,
        canStopServer,
        isInstalled,
        updateAvailable: ttsState?.updateAvailable ?? false,
        latestVersion: ttsState?.latestVersion,
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
