import { createContext, type PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import { Alert, Modal, ModalDialog, Stack, Typography } from "@mui/joy";
import { OnboardingApi, type OnboardingStep } from "../pudu/generated";
import { ErrorContext } from "./ErrorContextProvider";
import { onboardingStepRegistry } from "./onboardingStepRegistry";
import PuduStepper from "../components/organisms/common/PuduStepper";

interface OnboardingContextValue {
    pendingSteps: OnboardingStep[];
    activeStep: OnboardingStep | null;
    refreshPendingSteps: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export interface OnboardingApiClient {
    completeStep: (stepId: string) => Promise<{ success: boolean; error?: string | null }>;
    dismissStep: (stepId: string) => Promise<{ success: boolean; error?: string | null }>;
    getPendingSteps: () => Promise<{ success: boolean; data?: OnboardingStep[]; error?: string | null }>;
    markStepSeen: (stepId: string) => Promise<{ success: boolean; error?: string | null }>;
}

export interface OnboardingContextProviderProps extends PropsWithChildren {
    createApi?: () => OnboardingApiClient;
    errorReporter?: (input: {
        source: string;
        userMessage: string;
        code?: string | null;
        technicalDetails?: string | null;
    }) => void;
}

export function OnboardingContextProvider(props: OnboardingContextProviderProps) {
    const { children, createApi, errorReporter } = props;
    const errorContext = useContext(ErrorContext);
    const showError = errorReporter ?? errorContext?.showError ?? (() => { });
    const buildApi = createApi ?? (() => new OnboardingApi());
    const seenStepIdsRef = useRef(new Set<string>());

    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingStep, setIsUpdatingStep] = useState(false);
    const [allSteps, setAllSteps] = useState<OnboardingStep[]>([]);
    const [pendingSteps, setPendingSteps] = useState<OnboardingStep[]>([]);

    const activeStep = pendingSteps[0] ?? null;

    const fetchPendingSteps = async () => {
        setIsLoading(true);
        const api = buildApi();
        const result = await api.getPendingSteps();
        if (result.success && result.data) {
            const incomingSteps = result.data;
            setAllSteps((previous) => {
                if (previous.length === 0 || incomingSteps.length >= previous.length) {
                    return incomingSteps;
                }

                return previous;
            });
            setPendingSteps(incomingSteps);
            seenStepIdsRef.current.clear();
        } else {
            setAllSteps([]);
            setPendingSteps([]);
            showError({
                source: "frontend.onboarding.get-pending-steps",
                userMessage: "Failed to load onboarding steps.",
                code: "ONBOARDING_FETCH_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
            });
        }
        setIsLoading(false);
    };

    const refreshPendingSteps = async () => {
        await fetchPendingSteps();
    };

    useEffect(() => {
        void fetchPendingSteps();
    }, [showError]);

    useEffect(() => {
        if (!activeStep) {
            return;
        }

        if (seenStepIdsRef.current.has(activeStep.id)) {
            return;
        }

        seenStepIdsRef.current.add(activeStep.id);

        void (async () => {
            const api = buildApi();
            const result = await api.markStepSeen(activeStep.id);
            if (!result.success) {
                showError({
                    source: "frontend.onboarding.mark-step-seen",
                    userMessage: "Failed to update onboarding step state.",
                    code: "ONBOARDING_MARK_SEEN_FAILED",
                    technicalDetails: result.error ?? "Unknown backend error.",
                });
            }
        })();
    }, [activeStep, showError]);

    const advanceQueue = () => {
        setPendingSteps((prev) => prev.slice(1));
    };

    const completeCurrentStep = async () => {
        if (!activeStep || isUpdatingStep) {
            return;
        }

        setIsUpdatingStep(true);
        const api = buildApi();
        const result = await api.completeStep(activeStep.id);
        setIsUpdatingStep(false);

        if (!result.success) {
            showError({
                source: "frontend.onboarding.complete-step",
                userMessage: "Failed to complete onboarding step.",
                code: "ONBOARDING_COMPLETE_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
            });
            return;
        }

        advanceQueue();
    };

    const dismissCurrentStep = async () => {
        if (!activeStep || isUpdatingStep) {
            return;
        }

        if (activeStep.isRequired) {
            return;
        }

        setIsUpdatingStep(true);
        const api = buildApi();
        const result = await api.dismissStep(activeStep.id);
        setIsUpdatingStep(false);

        if (!result.success) {
            showError({
                source: "frontend.onboarding.dismiss-step",
                userMessage: "Failed to dismiss onboarding step.",
                code: "ONBOARDING_DISMISS_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
            });
            return;
        }

        advanceQueue();
    };

    const ActiveStepComponent = activeStep
        ? onboardingStepRegistry[activeStep.componentKey]
        : null;

    const value: OnboardingContextValue = {
        pendingSteps,
        activeStep,
        refreshPendingSteps,
    };

    const missingComponentReferenceWarning = () => (
        <Stack spacing={2} sx={{ maxWidth: 720, width: "100%" }}>
            <Typography level="h3">
                {activeStep?.title ?? "Onboarding step"}
            </Typography>
            <Alert color="warning" variant="soft">
                No component is registered for onboarding key "{activeStep?.componentKey}".
            </Alert>
            {activeStep?.description && (
                <>
                    <Typography>
                        Description was:
                    </Typography>
                    <Typography>
                        {activeStep.description}
                    </Typography>
                </>
            )}
        </Stack>
    );

    const maxStepOrder = allSteps.reduce(
        (currentMax, step) => Math.max(currentMax, step.order),
        -1,
    );
    const maxSteps = Math.max(maxStepOrder + 1, allSteps.length, 1);

    const stepLabels = Array.from(
        { length: maxSteps },
        (_, stepNumber) => `Step ${stepNumber + 1}`,
    );

    for (const step of allSteps) {
        if (step.order >= 0 && step.order < maxSteps) {
            stepLabels[step.order] = step.title;
        }
    }

    const activeStepIndex =
        activeStep
            ? allSteps.findIndex((s) => s.id === activeStep.id)
            : -1;
    const currentStep = activeStepIndex >= 0
        ? activeStepIndex + 1
        : activeStep
            ? Math.min(Math.max(activeStep.order + 1, 1), maxSteps)
            : maxSteps;

    return (
        <OnboardingContext.Provider value={value}>
            {children}

            <Modal open={!isLoading && activeStep !== null}>
                <ModalDialog layout="fullscreen">
                    <Stack spacing={2} justifyContent="flex-start" alignItems="center" sx={{ width: "100%", height: "100%" }}>
                        {maxSteps > 1 && (
                            <PuduStepper
                                maxSteps={maxSteps}
                                currentStep={currentStep}
                                stepLabels={stepLabels}
                            />
                        )}
                        <Stack sx={{ width: "100%", height: "100%" }}>
                            {ActiveStepComponent ? (
                                <ActiveStepComponent
                                    step={activeStep!}
                                    onComplete={completeCurrentStep}
                                    onDismiss={dismissCurrentStep}
                                />
                            ) : missingComponentReferenceWarning()}
                        </Stack>
                    </Stack>
                </ModalDialog>
            </Modal>
        </OnboardingContext.Provider>
    );
}

export function useOnboardingContext() {
    const context = useContext(OnboardingContext);

    if (context === undefined) {
        throw new Error("useOnboardingContext must be used within a OnboardingContextProvider.");
    }

    return context;
}
