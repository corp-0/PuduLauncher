import { Alert, Button, Chip, CircularProgress, Stack, Typography } from "@mui/joy";
import { useCallback, useEffect, useState } from "react";
import { TTS_STATUS, TTS_STATUS_LABELS } from "../../../../constants/ttsStatus";
import { useErrorContext } from "../../../../contextProviders/ErrorContextProvider";
import { EventListener } from "../../../../pudu/events/event-listener";
import { TtsApi, type Preferences, type TtsState } from "../../../../pudu/generated";
import PreferencePathFieldRow from "../PreferencePathFieldRow";
import PreferenceToggleFieldRow from "../PreferenceToggleFieldRow";

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

function getStatusChipColor(status: number | null): "neutral" | "success" | "warning" | "danger" | "primary" {
    if (status === TTS_STATUS.Error) {
        return "danger";
    }

    if (status === TTS_STATUS.ServerRunning || status === TTS_STATUS.Installed) {
        return "success";
    }

    if (status === TTS_STATUS.Downloading || status === TTS_STATUS.Installing || status === TTS_STATUS.CheckingForUpdates) {
        return "primary";
    }

    if (status === TTS_STATUS.ServerStopped) {
        return "warning";
    }

    return "neutral";
}

export interface TtsPreferencesLayoutViewProps {
    categoryKey: string;
    preferences: Preferences;
    updateField: (categoryKey: string, fieldKey: string, value: unknown) => void;
    isLoadingState: boolean;
    status: number | null;
    statusMessage?: string | null;
    errorMessage?: string | null;
    isBusy: boolean;
    canStartServer: boolean;
    canStopServer: boolean;
    isInstalled: boolean;
    onInstall: () => Promise<void>;
    onCheckForUpdates: () => Promise<void>;
    onStartServer: () => Promise<void>;
    onStopServer: () => Promise<void>;
    onUninstall: () => Promise<void>;
}

export function TtsPreferencesLayoutView(props: TtsPreferencesLayoutViewProps) {
    const {
        categoryKey,
        preferences,
        updateField,
        isLoadingState,
        status,
        errorMessage,
        isBusy,
        canStartServer,
        canStopServer,
        isInstalled,
        onInstall,
        onCheckForUpdates,
        onStartServer,
        onStopServer,
        onUninstall,
    } = props;

    const statusLabel = status !== null
        ? (TTS_STATUS_LABELS[status] ?? `Status ${status}`)
        : "Unknown";

    const installButtonLabel = isInstalled ? "Reinstall HonkTTS" : "Install HonkTTS";

    return (
        <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography level="title-sm">TTS status</Typography>
                {isLoadingState ? (
                    <CircularProgress size="sm" />
                ) : (
                    <Chip color={getStatusChipColor(status)} variant="soft">
                        {statusLabel}
                    </Chip>
                )}
            </Stack>

            {errorMessage && (
                <Alert color="danger" variant="soft">
                    {errorMessage}
                </Alert>
            )}

            <PreferenceToggleFieldRow
                label="Enable HonkTTS"
                tooltip="Turns immersive voices on or off."
                value={preferences.tts.enabled}
                onChange={(next) => updateField(categoryKey, "enabled", next)}
            />
            <PreferencePathFieldRow
                label="Install path"
                tooltip="Folder where the HonkTTS runtime is installed."
                value={preferences.tts.installPath}
                onChange={(next) => updateField(categoryKey, "installPath", next)}
            />
            <PreferenceToggleFieldRow
                label="Start on launcher startup"
                tooltip="Automatically starts HonkTTS when PuduLauncher starts."
                value={preferences.tts.autoStartOnLaunch}
                onChange={(next) => updateField(categoryKey, "autoStartOnLaunch", next)}
            />

            <Stack direction="row" spacing={1} sx={{ pt: 0.5, flexWrap: "wrap" }}>
                <Button size="sm" disabled={isBusy} onClick={() => void onInstall()}>
                    {installButtonLabel}
                </Button>
                <Button size="sm" variant="outlined" disabled={isBusy} onClick={() => void onCheckForUpdates()}>
                    Check updates
                </Button>
                <Button size="sm" variant="outlined" disabled={isBusy || !canStartServer} onClick={() => void onStartServer()}>
                    Start server
                </Button>
                <Button size="sm" variant="outlined" disabled={isBusy || !canStopServer} onClick={() => void onStopServer()}>
                    Stop server
                </Button>
                <Button size="sm" color="danger" variant="soft" disabled={isBusy || !isInstalled} onClick={() => void onUninstall()}>
                    Uninstall
                </Button>
            </Stack>
        </Stack>
    );
}

interface TtsPreferencesLayoutProps {
    categoryKey: string;
    preferences: Preferences;
    updateField: (categoryKey: string, fieldKey: string, value: unknown) => void;
}

export default function TtsPreferencesLayout(props: TtsPreferencesLayoutProps) {
    const { categoryKey, preferences, updateField } = props;
    const { showError } = useErrorContext();
    const [ttsState, setTtsState] = useState<TtsState | null>(null);
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [isRunningCommand, setIsRunningCommand] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const loadStatus = useCallback(async () => {
        const api = new TtsApi();
        const result = await api.getStatus();
        if (!result.success || !result.data) {
            showError({
                source: "frontend.preferences.tts.get-status",
                userMessage: "Failed to load TTS status.",
                code: "TTS_STATUS_FETCH_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
            });
            return;
        }

        setTtsState(result.data);
    }, [showError]);

    useEffect(() => {
        let isDisposed = false;

        void (async () => {
            try {
                await loadStatus();
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

        return () => {
            isDisposed = true;
            eventListener.disconnect();
        };
    }, [loadStatus, showError]);

    const runCommand = async (
        commandName: string,
        run: (api: TtsApi) => Promise<{ success: boolean; error?: string | null }>,
    ) => {
        if (isRunningCommand) {
            return;
        }

        setIsRunningCommand(true);
        const api = new TtsApi();
        const result = await run(api);
        setIsRunningCommand(false);

        if (!result.success) {
            showError({
                source: `frontend.preferences.tts.${commandName}`,
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

    return (
        <TtsPreferencesLayoutView
            categoryKey={categoryKey}
            preferences={preferences}
            updateField={updateField}
            isLoadingState={isLoadingState}
            status={status}
            statusMessage={statusMessage}
            errorMessage={ttsState?.errorMessage}
            isBusy={isBusy}
            canStartServer={canStartServer}
            canStopServer={canStopServer}
            isInstalled={isInstalled}
            onInstall={async () => runCommand("tts.install", (api) => api.install())}
            onCheckForUpdates={async () => runCommand("tts.check-for-updates", (api) => api.checkForUpdates())}
            onStartServer={async () => runCommand("tts.start-server", (api) => api.startServer())}
            onStopServer={async () => runCommand("tts.stop-server", (api) => api.stopServer())}
            onUninstall={async () => runCommand("tts.uninstall", (api) => api.uninstall())}
        />
    );
}
