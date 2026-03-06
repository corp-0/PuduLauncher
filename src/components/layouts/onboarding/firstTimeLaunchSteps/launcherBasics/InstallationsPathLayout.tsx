import { FolderOpen } from "@mui/icons-material";
import { Alert, IconButton, Input, Stack, Typography } from "@mui/joy";
import { open } from "@tauri-apps/plugin-dialog";
import type { JSX } from "react";
import { useState } from "react";
import OnboardingStepShell from "../../OnboardingStepShell";

interface InstallationsPathLayoutProps {
    installationsPath: string;
    isSubmitting: boolean;
    onInstallationsPathChange: (nextPath: string) => void;
    onContinue: () => Promise<void>;
}

export default function InstallationsPathLayout(props: InstallationsPathLayoutProps): JSX.Element {
    const { installationsPath, isSubmitting, onInstallationsPathChange, onContinue } = props;
    const [browseError, setBrowseError] = useState<string | null>(null);

    const canContinue = installationsPath.trim().length > 0 && !isSubmitting;

    const browseInstallationsPath = async () => {
        setBrowseError(null);

        try {
            const selected = await open({
                directory: true,
                multiple: false,
                defaultPath: installationsPath || undefined,
            });

            if (typeof selected === "string") {
                onInstallationsPathChange(selected);
            }
        } catch {
            setBrowseError("Could not open folder picker in this environment. You can still type the path manually.");
        }
    };

    return (
        <OnboardingStepShell
            actions={[
                {
                    label: "Continue",
                    onClick: onContinue,
                    disabled: !canContinue,
                    loading: isSubmitting,
                    fullWidth: true,
                },
            ]}
        >
            <Typography level="h2">Choose your installations folder</Typography>
            <Typography level="body-md">
                This is where PuduLauncher stores downloaded game builds. Whenever you join a server,
                the required build is downloaded and stored here.
            </Typography>
            <Typography level="body-sm" color="neutral">
                You can change this later from Preferences.
            </Typography>

            <Stack direction="row" spacing={1}>
                <Input
                    sx={{ flex: 1 }}
                    value={installationsPath}
                    placeholder="Example: C:\Games\Pudu\Installations"
                    onChange={(event) => onInstallationsPathChange(event.target.value)}
                />
                <IconButton
                    variant="outlined"
                    color="neutral"
                    title="Browse folder"
                    onClick={() => void browseInstallationsPath()}
                >
                    <FolderOpen />
                </IconButton>
            </Stack>

            {browseError && (
                <Alert color="warning" variant="soft">
                    {browseError}
                </Alert>
            )}
        </OnboardingStepShell>
    );
}
