import CheckRounded from "@mui/icons-material/CheckRounded";
import { Step, StepIndicator, Stepper } from "@mui/joy";

interface PuduStepperProps {
    maxSteps: number;
    currentStep: number;
    stepLabels?: string[];
    isComplete?: boolean;
}

export default function PuduStepper(props: PuduStepperProps) {
    const { maxSteps, currentStep, stepLabels, isComplete = false } = props;
    const stepCount = Math.max(1, Math.floor(maxSteps));
    const activeStep = Math.min(Math.max(Math.floor(currentStep), 1), stepCount);

    const steps = Array.from({ length: stepCount }, (_, index) => index + 1);

    return (
        <Stepper sx={{ width: '100%' }}>
            {steps.map((stepNumber) => {
                const isCompleted = isComplete || stepNumber < activeStep;
                const isCurrent = !isComplete && stepNumber === activeStep;
                const indicatorVariant = isCurrent ? "solid" : isCompleted ? "soft" : "outlined";
                const indicatorColor = isCurrent ? "primary" : isCompleted ? "success" : "neutral";

                return (
                    <Step
                        key={stepNumber}
                        orientation="vertical"
                        indicator={
                            <StepIndicator
                                variant={indicatorVariant}
                                color={indicatorColor}
                            >
                                {isCompleted ? <CheckRounded fontSize="inherit" /> : stepNumber}
                            </StepIndicator>
                        }
                    >
                        {stepLabels?.[stepNumber - 1] ?? `Step ${stepNumber}`}
                    </Step>
                );
            })}
        </Stepper>
    )
}
