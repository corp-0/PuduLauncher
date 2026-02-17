import { AspectRatio, Button, Card, Link, Stack, Typography } from "@mui/joy";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { JSX, MouseEvent } from "react";
import { UNITYSTATION_DISCORD_URL } from "../../../../constants/externalLinks";
import type { OnboardingStepComponentProps } from "../../../../contextProviders/onboardingStepRegistry";

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
        <Stack sx={{ height: "100%", minHeight: 0, p: 8 }}>
            <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="center"
                sx={{
                    width: "100%",
                    gap: 3,
                    flexWrap: "wrap",
                    flex: 1,
                    minHeight: 0,
                    overflow: "auto",
                }}
            >
                <Card variant="plain" sx={{ flex: "1 1 360px", minWidth: 280, maxWidth: "50%" }}>
                    <Typography level="h2">Welcome to PuduLauncher!</Typography>
                    <Stack spacing={1}>
                        <Typography level="body-md">
                            Thanks for being here. Our goal is simple: deliver a smoother, more polished Unitystation
                            launcher experience, and grow into the official launcher over time.
                        </Typography>
                        <Typography level="body-md">
                            If you have any suggestion, don't hesitate to let Gilles know on{" "}
                            <Link href={UNITYSTATION_DISCORD_URL} onClick={(event) => void openDiscord(event)}>
                                Unitystation&apos;s Discord
                            </Link>.
                        </Typography>
                    </Stack>
                </Card>

                <AspectRatio
                    ratio="14/9"
                    variant="plain"
                    sx={{
                        width: "clamp(220px, 38vw, 420px)",
                        borderRadius: "md",
                        overflow: "hidden",
                        alignSelf: "center",
                    }}
                >
                    <img
                        src="/aiPlaceholders/pudu-maqui.png"
                        alt="Welcome to PuduLauncher"
                        loading="lazy"
                        style={{ objectFit: "cover" }}
                    />
                </AspectRatio>
            </Stack>

            <Stack direction="row" justifyContent="center" sx={{ mt: "auto", pt: 2, px: 16 }}>
                <Button fullWidth size="lg" onClick={onComplete}>Let&apos;s go!</Button>
            </Stack>
        </Stack>
    );
}
