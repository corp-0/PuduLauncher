import { Alert, Button, Chip, CircularProgress, Stack, Typography } from "@mui/joy";
import { TTS_STATUS, TTS_STATUS_LABELS } from "../../../../constants/ttsStatus";
import { useTtsPreferencesContext } from "../../../../contextProviders/TtsPreferencesContextProvider";
import type { Preferences } from "../../../../pudu/generated";
import PreferencePathFieldRow from "../PreferencePathFieldRow";
import PreferenceToggleFieldRow from "../PreferenceToggleFieldRow";

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

interface TtsPreferencesLayoutProps {
    categoryKey: string;
    preferences: Preferences;
    updateField: (categoryKey: string, fieldKey: string, value: unknown) => void;
}

export default function TtsPreferencesLayout(props: TtsPreferencesLayoutProps) {
    const { categoryKey, preferences, updateField } = props;
    const {
        isLoadingState,
        status,
        errorMessage,
        isBusy,
        canStartServer,
        canStopServer,
        isInstalled,
        updateAvailable,
        latestVersion,
        runCommand,
    } = useTtsPreferencesContext();

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

            {updateAvailable && (
                <Alert
                    color="warning"
                    variant="soft"
                    endDecorator={
                        <Button
                            size="sm"
                            variant="solid"
                            color="primary"
                            disabled={isBusy}
                            onClick={() => void runCommand("install")}
                        >
                            Update now
                        </Button>
                    }
                >
                    A new version{latestVersion ? ` (${latestVersion})` : ""} is available.
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
                <Button size="sm" disabled={isBusy} onClick={() => void runCommand("install")}>
                    {installButtonLabel}
                </Button>
                <Button size="sm" variant="outlined" disabled={isBusy} onClick={() => void runCommand("checkForUpdates")}>
                    Check updates
                </Button>
                <Button size="sm" variant="outlined" disabled={isBusy || !canStartServer} onClick={() => void runCommand("startServer")}>
                    Start server
                </Button>
                <Button size="sm" variant="outlined" disabled={isBusy || !canStopServer} onClick={() => void runCommand("stopServer")}>
                    Stop server
                </Button>
                <Button size="sm" color="danger" variant="soft" disabled={isBusy || !isInstalled} onClick={() => void runCommand("uninstall")}>
                    Uninstall
                </Button>
            </Stack>
        </Stack>
    );
}
