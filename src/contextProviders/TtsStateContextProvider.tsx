import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";
import { TTS_STATUS } from "../constants/ttsStatus";
import { EventListener } from "../pudu/events/event-listener";
import { TtsApi, type TtsState } from "../pudu/generated";
import { useFeedbackContext } from "./FeedbackContextProvider";

export interface TtsStateContextValue {
    ttsState: TtsState | null;
    status: number | null;
    statusMessage: string | null;
    isLoadingState: boolean;
    installLogs: string[];
    loadStatus: () => Promise<TtsState | null>;
    clearInstallLogs: () => void;
}

const TtsStateContext = createContext<TtsStateContextValue | undefined>(undefined);

export function TtsStateContextProvider(props: PropsWithChildren) {
    const { children } = props;
    const { showError } = useFeedbackContext();
    const [ttsState, setTtsState] = useState<TtsState | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [installLogs, setInstallLogs] = useState<string[]>([]);

    const loadStatus = async () => {
        const api = new TtsApi();
        const result = await api.getStatus();
        if (!result.success || !result.data) {
            showError({
                source: "frontend.tts.get-status",
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
                await loadStatus();
            } catch (error: unknown) {
                if (!isDisposed) {
                    showError({
                        source: "frontend.tts.get-status",
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
                        : null,
                };
            });

            if (event.status === TTS_STATUS.Installed
                || event.status === TTS_STATUS.NotInstalled
                || event.status === TTS_STATUS.Error) {
                void loadStatus();
            }
        });

        eventListener.on("tts:update-available", (event) => {
            if (isDisposed) {
                return;
            }

            setTtsState((previous) => {
                if (previous === null) {
                    return previous;
                }

                return {
                    ...previous,
                    updateAvailable: true,
                    latestVersion: event.latestVersion,
                };
            });
        });

        eventListener.on("tts:install-output", (event) => {
            if (isDisposed) {
                return;
            }

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
    }, []);

    const clearInstallLogs = () => {
        setInstallLogs([]);
    };

    const value: TtsStateContextValue = {
        ttsState,
        status: ttsState?.status ?? null,
        statusMessage,
        isLoadingState,
        installLogs,
        loadStatus,
        clearInstallLogs,
    };

    return (
        <TtsStateContext.Provider value={value}>
            {children}
        </TtsStateContext.Provider>
    );
}

export function useTtsState() {
    const context = useContext(TtsStateContext);
    if (context === undefined) {
        throw new Error("useTtsState must be used within a TtsStateContextProvider.");
    }

    return context;
}
