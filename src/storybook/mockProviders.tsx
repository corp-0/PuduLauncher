import type { PropsWithChildren } from "react";
import {
    ErrorContext,
    type ErrorContextValue,
} from "../contextProviders/ErrorContextProvider";
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

export function createMockErrorContextValue(
    overrides: Partial<ErrorContextValue> = {},
): ErrorContextValue {
    return {
        showError: NOOP,
        showFatal: NOOP,
        clearFatal: NOOP,
        recentErrors: [],
        ...overrides,
    };
}

interface MockErrorProviderProps extends PropsWithChildren {
    value?: Partial<ErrorContextValue>;
}

export function MockErrorProvider(props: MockErrorProviderProps) {
    const { children, value } = props;

    return (
        <ErrorContext.Provider value={createMockErrorContextValue(value)}>
            {children}
        </ErrorContext.Provider>
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
    errorContextValue?: Partial<ErrorContextValue>;
    errorReporter?: OnboardingContextProviderProps["errorReporter"];
}

export function MockOnboardingProvider(props: MockOnboardingProviderProps) {
    const {
        children,
        pendingSteps,
        createApi,
        apiMockOptions,
        errorContextValue,
        errorReporter,
    } = props;

    const createApiForProvider = createApi
        ?? (() => createOnboardingApiMock({
            pendingSteps,
            ...apiMockOptions,
        }));

    return (
        <MockErrorProvider value={errorContextValue}>
            <OnboardingContextProvider
                createApi={createApiForProvider}
                errorReporter={errorReporter}
            >
                {children}
            </OnboardingContextProvider>
        </MockErrorProvider>
    );
}
