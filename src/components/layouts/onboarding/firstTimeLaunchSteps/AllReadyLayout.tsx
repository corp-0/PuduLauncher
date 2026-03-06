import { Typography } from "@mui/joy";
import type { JSX } from "react";
import type { OnboardingStepComponentProps } from "../../../../contextProviders/onboardingStepRegistry";
import OnboardingStepShell from "../OnboardingStepShell";

export default function AllReadyLayout(props: OnboardingStepComponentProps): JSX.Element {
    const { onComplete } = props;

    return (
        <OnboardingStepShell
            actions={[
                { label: "Start using PuduLauncher", onClick: onComplete },
            ]}
            maxContentWidth={480}
        >
            <Typography level="h2" textAlign="center">You are all set</Typography>
            <Typography level="body-md" textAlign="center">
                PuduLauncher is ready to use.
            </Typography>
        </OnboardingStepShell>
    );
}
