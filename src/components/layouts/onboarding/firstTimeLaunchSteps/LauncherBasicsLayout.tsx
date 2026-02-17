import { Stack } from "@mui/joy";
import type { JSX } from "react";
import { StepContextProvider } from "../../../../contextProviders/StepContextProvider";
import type { OnboardingStepComponentProps } from "../../../../contextProviders/onboardingStepRegistry";
import MainLayout from "./launcherBasics/MainLayout";

export default function LauncherBasicsLayout(props: OnboardingStepComponentProps): JSX.Element {
    return (
        <Stack sx={{ height: "100%", minHeight: 0, p: 8 }}>
            <StepContextProvider initialStep={0} maxSteps={3}>
                <MainLayout {...props} />
            </StepContextProvider>
        </Stack>
    );
}
