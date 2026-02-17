import { Button, Stack, Typography } from "@mui/joy";
import type { JSX } from "react";
import type { OnboardingStepComponentProps } from "../../../../contextProviders/onboardingStepRegistry";

export default function AllReadyLayout(props: OnboardingStepComponentProps): JSX.Element {
    const { onComplete } = props;

    return (
        <Stack spacing={2} sx={{ height: "100%", alignItems: "center", justifyContent: "center", p: 8 }}>
            <Typography level="h2">You are all set</Typography>
            <Typography level="body-md">PuduLauncher is ready to use.</Typography>
            <Button size="lg" onClick={onComplete}>Start using PuduLauncher</Button>
        </Stack>
    );
}
