import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";

interface StepContextProps extends PropsWithChildren {
    maxSteps: number;
    initialStep?: number;
}

interface StepContextValue {
    currentStep: number;
    maxSteps: number;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
}

const StepContext = createContext<StepContextValue | undefined>(undefined);

export function StepContextProvider(props: StepContextProps) {
    const maxIndex = Math.max(props.maxSteps - 1, 0);

    const [currentStep, setCurrentStep] = useState(() => {
        const start = props.initialStep ?? 0;
        return Math.min(Math.max(start, 0), maxIndex);
    });

    useEffect(() => {
        setCurrentStep((prev) => Math.min(Math.max(prev, 0), maxIndex));
    }, [maxIndex]);

    const goToNextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, maxIndex));
    };

    const goToPreviousStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    return (
        <StepContext.Provider value={{
            currentStep,
            maxSteps: props.maxSteps,
            goToNextStep,
            goToPreviousStep
        }}>
            {props.children}
        </StepContext.Provider>
    );

}


export function useStepContext() {
    const context = useContext(StepContext);
    if (!context) {
        throw new Error("useStepContext must be used within a StepContextProvider");
    }

    return context;
}