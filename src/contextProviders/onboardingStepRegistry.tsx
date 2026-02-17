import type { ComponentType } from "react";
import type { OnboardingStep } from "../pudu/generated";
import WelcomeLayout from "../components/layouts/onboarding/firstTimeLaunchSteps/WelcomeLayout";
import LauncherBasicsLayout from "../components/layouts/onboarding/firstTimeLaunchSteps/LauncherBasicsLayout";
import AllReadyLayout from "../components/layouts/onboarding/firstTimeLaunchSteps/AllReadyLayout";

export interface OnboardingStepComponentProps {
    step: OnboardingStep;
    onComplete: () => Promise<void>;
    onDismiss: () => Promise<void>;
}

export type OnboardingStepComponent = ComponentType<OnboardingStepComponentProps>;

export const onboardingStepRegistry: Record<string, OnboardingStepComponent> = {
    "welcome": WelcomeLayout,
    "launcher-basics": LauncherBasicsLayout,
    "all-ready": AllReadyLayout,
};
