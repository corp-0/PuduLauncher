import { Button, Card, Stack, Typography } from "@mui/joy";
import type { JSX } from "react";

interface ImmersiveVoicesIntroLayoutProps {
    isSubmitting: boolean;
    onEnable: () => void;
    onSkip: () => Promise<void>;
}

export default function ImmersiveVoicesIntroLayout(props: ImmersiveVoicesIntroLayoutProps): JSX.Element {
    const { isSubmitting, onEnable, onSkip } = props;

    return (
        <Stack sx={{ height: "100%", minHeight: 0 }}>
            <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "auto",
                }}
            >
                <Card variant="outlined" sx={{ width: "min(860px, 100%)", p: 3 }}>
                    <Stack spacing={2}>
                        <Typography level="h2">Immersive voices with HonkTTS</Typography>
                        <Typography level="body-md">
                            HonkTTS is the local text-to-speech server used by PuduLauncher immersive voices.
                            It runs on your machine and adds voices to characters in-game.
                        </Typography>
                        <Typography level="body-sm" color="neutral">
                            You can skip for now and enable it later from Preferences.
                        </Typography>
                    </Stack>
                </Card>
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: "auto", pt: 2, px: 16 }}>
                <Button variant="outlined" size="lg" disabled={isSubmitting} onClick={() => void onSkip()}>
                    Skip for now
                </Button>
                <Button size="lg" disabled={isSubmitting} onClick={onEnable}>
                    Enable HonkTTS
                </Button>
            </Stack>
        </Stack>
    );
}
