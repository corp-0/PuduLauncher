import { Box, Button, Stack } from "@mui/joy";
import { motion, AnimatePresence } from "motion/react";
import type { JSX, ReactNode } from "react";

export interface OnboardingAction {
    label: string;
    onClick: (() => void) | (() => Promise<void>);
    variant?: "solid" | "soft" | "outlined" | "plain";
    color?: "primary" | "neutral" | "danger" | "success" | "warning";
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
}

interface OnboardingStepShellProps {
    children: ReactNode;
    actions?: OnboardingAction[];
    illustration?: ReactNode;
    maxContentWidth?: number | string;
}

export default function OnboardingStepShell(props: OnboardingStepShellProps): JSX.Element {
    const {
        children,
        actions,
        illustration,
        maxContentWidth = 720,
    } = props;

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                px: { xs: 3, sm: 6, md: 8 },
                pt: { xs: 4, sm: 6 },
                pb: 2,
            }}
        >
            <Stack
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {illustration ? (
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={4}
                        alignItems="center"
                        justifyContent="center"
                        sx={{ width: "100%", maxWidth: 960 }}
                    >
                        <ContentContainer maxWidth={maxContentWidth} flex="1 1 55%">
                            {children}
                        </ContentContainer>
                        <Box
                            sx={{
                                flex: "0 1 40%",
                                maxWidth: 420,
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            {illustration}
                        </Box>
                    </Stack>
                ) : (
                    <ContentContainer maxWidth={maxContentWidth}>
                        {children}
                    </ContentContainer>
                )}
            </Stack>

            {/* Action bar */}
            {actions && actions.length > 0 && (
                <Stack
                    direction="row"
                    spacing={1.5}
                    justifyContent="center"
                    sx={{
                        pt: 3,
                        pb: 2,
                        px: { xs: 0, sm: 4, md: 12 },
                    }}
                >
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant={action.variant ?? "solid"}
                            color={action.color ?? "primary"}
                            size="lg"
                            disabled={action.disabled}
                            loading={action.loading}
                            fullWidth={action.fullWidth}
                            onClick={() => void action.onClick()}
                            sx={{
                                minWidth: 140,
                                fontWeight: 600,
                                letterSpacing: "0.02em",
                                ...(action.fullWidth ? {} : { px: 4 }),
                            }}
                        >
                            {action.label}
                        </Button>
                    ))}
                </Stack>
            )}
        </Box>
    );
}

function ContentContainer(props: {
    children: ReactNode;
    maxWidth: number | string;
    flex?: string;
}) {
    return (
        <Stack
            spacing={2.5}
            sx={{
                width: "100%",
                maxWidth: props.maxWidth,
                flex: props.flex,
                p: { xs: 3, sm: 4 },
            }}
        >
            {props.children}
        </Stack>
    );
}

const MotionBox = motion.create(Box);

export function OnboardingAnimatedContent(props: { stepKey: string; children: ReactNode }) {
    return (
        <AnimatePresence mode="wait">
            <MotionBox
                key={props.stepKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                sx={{ width: "100%", height: "100%", flex: 1, minHeight: 0 }}
            >
                {props.children}
            </MotionBox>
        </AnimatePresence>
    );
}

export function OnboardingBackground() {
    return (
        <Box
            sx={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                overflow: "hidden",
                background: (theme) => {
                    const primary = theme.palette.primary[800] ?? theme.palette.primary.mainChannel;
                    const bg = theme.palette.background.body;
                    return `radial-gradient(ellipse 80% 60% at 20% 10%, ${primary}, transparent 70%),
                            radial-gradient(ellipse 60% 50% at 80% 80%, ${primary}, transparent 70%),
                            ${bg}`;
                },
                "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                    opacity: 0.03,
                    mixBlendMode: "overlay",
                    pointerEvents: "none",
                },
            }}
        />
    );
}
