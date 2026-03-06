import { Box, Stack } from "@mui/joy";

interface OnboardingProgressDotsProps {
    totalSteps: number;
    currentStep: number;
}

export default function OnboardingProgressDots(props: OnboardingProgressDotsProps) {
    const { totalSteps, currentStep } = props;

    if (totalSteps <= 1) {
        return null;
    }

    return (
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            {Array.from({ length: totalSteps }, (_, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                    <Box
                        key={index}
                        sx={{
                            width: isActive ? 24 : 8,
                            height: 8,
                            borderRadius: 99,
                            backgroundColor: isActive
                                ? "primary.400"
                                : isCompleted
                                    ? "primary.700"
                                    : "neutral.700",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                    />
                );
            })}
        </Stack>
    );
}
