import { Typography } from "@mui/joy";
import type { JSX } from "react";
import OnboardingStepShell from "../../OnboardingStepShell";

interface ImmersiveVoicesIntroLayoutProps {
    isSubmitting: boolean;
    onEnable: () => void;
    onSkip: () => Promise<void>;
}

export default function ImmersiveVoicesIntroLayout(props: ImmersiveVoicesIntroLayoutProps): JSX.Element {
    const { isSubmitting, onEnable, onSkip } = props;

    return (
        <OnboardingStepShell
            actions={[
                {
                    label: "Skip for now",
                    onClick: onSkip,
                    variant: "outlined",
                    color: "neutral",
                    disabled: isSubmitting,
                },
                {
                    label: "Enable HonkTTS",
                    onClick: onEnable,
                    disabled: isSubmitting,
                },
            ]}
        >
            <Typography level="h2">Immersive voices with HonkTTS</Typography>
            <Typography level="body-md">
                HonkTTS is the local text-to-speech server used by PuduLauncher immersive voices.
                It runs on your machine and adds voices to characters in-game.
            </Typography>
            <Typography level="body-sm" color="neutral">
                You can skip for now and enable it later from Preferences.
            </Typography>
        </OnboardingStepShell>
    );
}
