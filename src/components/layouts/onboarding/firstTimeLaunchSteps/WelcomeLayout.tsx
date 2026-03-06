import { AspectRatio, Link, Typography } from "@mui/joy";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { JSX, MouseEvent } from "react";
import { UNITYSTATION_DISCORD_URL } from "../../../../constants/externalLinks";
import type { OnboardingStepComponentProps } from "../../../../contextProviders/onboardingStepRegistry";
import OnboardingStepShell from "../OnboardingStepShell";

export default function WelcomeLayout(props: OnboardingStepComponentProps): JSX.Element {
    const { onComplete } = props;

    const openDiscord = async (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        try {
            await openUrl(UNITYSTATION_DISCORD_URL);
        } catch {
            window.open(UNITYSTATION_DISCORD_URL, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <OnboardingStepShell
            actions={[
                { label: "Let's go!", onClick: onComplete, fullWidth: true },
            ]}
            illustration={
                <AspectRatio
                    ratio="14/9"
                    variant="plain"
                    sx={{
                        width: "clamp(220px, 38vw, 420px)",
                        borderRadius: "lg",
                        overflow: "hidden",
                    }}
                >
                    <img
                        src="/aiPlaceholders/pudu-maqui.png"
                        alt="Welcome to PuduLauncher"
                        loading="lazy"
                        style={{ objectFit: "cover" }}
                    />
                </AspectRatio>
            }
        >
            <Typography level="h2">Welcome to PuduLauncher!</Typography>
            <Typography level="body-md">
                Thanks for being here. Our goal is simple: deliver a smoother, more polished Unitystation
                launcher experience, and grow into the official launcher over time.
            </Typography>
            <Typography level="body-md">
                If you have any suggestion, don&apos;t hesitate to let Gilles know on{" "}
                <Link href={UNITYSTATION_DISCORD_URL} onClick={(event) => void openDiscord(event)}>
                    Unitystation&apos;s Discord
                </Link>.
            </Typography>
        </OnboardingStepShell>
    );
}
