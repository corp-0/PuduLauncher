import { FolderOpen } from "@mui/icons-material";
import { Alert, IconButton, Input, Stack, Switch, Typography } from "@mui/joy";
import { open } from "@tauri-apps/plugin-dialog";
import type { JSX } from "react";
import { useState } from "react";
import OnboardingStepShell from "../../OnboardingStepShell";

interface HonkTtsSetupLayoutProps {
    installPath: string;
    autoStartOnLaunch: boolean;
    isSubmitting: boolean;
    onInstallPathChange: (nextInstallPath: string) => void;
    onAutoStartOnLaunchChange: (nextValue: boolean) => void;
    onBack: () => void;
    onContinue: () => Promise<void>;
}

export default function HonkTtsSetupLayout(props: HonkTtsSetupLayoutProps): JSX.Element {
    const {
        installPath,
        autoStartOnLaunch,
        isSubmitting,
        onInstallPathChange,
        onAutoStartOnLaunchChange,
        onBack,
        onContinue,
    } = props;

    const [browseError, setBrowseError] = useState<string | null>(null);

    const canContinue = installPath.trim().length > 0 && !isSubmitting;

    const browseInstallPath = async () => {
        setBrowseError(null);

        try {
            const selected = await open({
                directory: true,
                multiple: false,
                defaultPath: installPath || undefined,
            });

            if (typeof selected === "string") {
                onInstallPathChange(selected);
            }
        } catch {
            setBrowseError("Could not open folder picker in this environment. You can still type the path manually.");
        }
    };

    return (
        <OnboardingStepShell
            actions={[
                {
                    label: "Back",
                    onClick: onBack,
                    variant: "outlined",
                    color: "neutral",
                    disabled: isSubmitting,
                },
                {
                    label: "Continue",
                    onClick: onContinue,
                    disabled: !canContinue,
                    loading: isSubmitting,
                },
            ]}
        >
            <Typography level="h2">Set up HonkTTS</Typography>
            <Typography level="body-md">
                Choose where HonkTTS should be installed and whether it should start automatically when
                PuduLauncher starts.
            </Typography>

            <Stack spacing={0.75}>
                <Typography level="title-sm">HonkTTS installation path</Typography>
                <Stack direction="row" spacing={1}>
                    <Input
                        sx={{ flex: 1 }}
                        value={installPath}
                        placeholder="Example: C:\Games\Pudu\HonkTTS"
                        onChange={(event) => onInstallPathChange(event.target.value)}
                    />
                    <IconButton
                        variant="outlined"
                        color="neutral"
                        title="Browse folder"
                        onClick={() => void browseInstallPath()}
                    >
                        <FolderOpen />
                    </IconButton>
                </Stack>
            </Stack>

            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    px: 1.25,
                    py: 1,
                    borderRadius: "md",
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.level1",
                }}
            >
                <Stack spacing={0.25}>
                    <Typography level="title-sm">Start HonkTTS on launcher startup</Typography>
                    <Typography level="body-sm" color="neutral">
                        Recommended so you don't forget to start it manually in preferences.
                    </Typography>
                </Stack>
                <Switch
                    checked={autoStartOnLaunch}
                    onChange={(event) => onAutoStartOnLaunchChange(event.target.checked)}
                />
            </Stack>

            {browseError && (
                <Alert color="warning" variant="soft">
                    {browseError}
                </Alert>
            )}
        </OnboardingStepShell>
    );
}
