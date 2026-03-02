import type { PropsWithChildren } from "react";
import {
    FeedbackContext,
    type FeedbackContextValue,
} from "../contextProviders/FeedbackContextProvider";
import {
    OnboardingContextProvider,
    type OnboardingApiClient,
    type OnboardingContextProviderProps,
} from "../contextProviders/OnboardingContextProvider";
import type { OnboardingStep } from "../pudu/generated";

interface OnboardingCommandResult {
    success: boolean;
    error?: string | null;
}

const NOOP = () => { };

export function createMockFeedbackContextValue(
    overrides: Partial<FeedbackContextValue> = {},
): FeedbackContextValue {
    return {
        showError: NOOP,
        showFatal: NOOP,
        clearFatal: NOOP,
        recentErrors: [],
        showSuccess: NOOP,
        showInfo: NOOP,
        showWarning: NOOP,
        ...overrides,
    };
}

interface MockFeedbackProviderProps extends PropsWithChildren {
    value?: Partial<FeedbackContextValue>;
}

export function MockFeedbackProvider(props: MockFeedbackProviderProps) {
    const { children, value } = props;

    return (
        <FeedbackContext.Provider value={createMockFeedbackContextValue(value)}>
            {children}
        </FeedbackContext.Provider>
    );
}

interface OnboardingApiMockOptions {
    pendingSteps: OnboardingStep[];
    completeStepResult?: OnboardingCommandResult;
    dismissStepResult?: OnboardingCommandResult;
    markStepSeenResult?: OnboardingCommandResult;
    onCompleteStep?: (stepId: string) => void;
    onDismissStep?: (stepId: string) => void;
    onMarkStepSeen?: (stepId: string) => void;
}

export function createOnboardingApiMock(options: OnboardingApiMockOptions): OnboardingApiClient {
    const {
        pendingSteps,
        completeStepResult = { success: true },
        dismissStepResult = { success: true },
        markStepSeenResult = { success: true },
        onCompleteStep,
        onDismissStep,
        onMarkStepSeen,
    } = options;

    return {
        completeStep: async (stepId) => {
            onCompleteStep?.(stepId);
            return completeStepResult;
        },
        dismissStep: async (stepId) => {
            onDismissStep?.(stepId);
            return dismissStepResult;
        },
        getPendingSteps: async () => ({
            success: true,
            data: [...pendingSteps],
        }),
        markStepSeen: async (stepId) => {
            onMarkStepSeen?.(stepId);
            return markStepSeenResult;
        },
    };
}

interface MockOnboardingProviderProps extends PropsWithChildren {
    pendingSteps: OnboardingStep[];
    createApi?: () => OnboardingApiClient;
    apiMockOptions?: Omit<OnboardingApiMockOptions, "pendingSteps">;
    feedbackContextValue?: Partial<FeedbackContextValue>;
    errorReporter?: OnboardingContextProviderProps["errorReporter"];
}

export function MockOnboardingProvider(props: MockOnboardingProviderProps) {
    const {
        children,
        pendingSteps,
        createApi,
        apiMockOptions,
        feedbackContextValue,
        errorReporter,
    } = props;

    const createApiForProvider = createApi
        ?? (() => createOnboardingApiMock({
            pendingSteps,
            ...apiMockOptions,
        }));

    return (
        <MockFeedbackProvider value={feedbackContextValue}>
            <OnboardingContextProvider
                createApi={createApiForProvider}
                errorReporter={errorReporter}
            >
                {children}
            </OnboardingContextProvider>
        </MockFeedbackProvider>
    );
}
