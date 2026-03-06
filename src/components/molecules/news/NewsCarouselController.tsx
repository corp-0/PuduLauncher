import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, IconButton, Stack } from "@mui/joy";
import type { PropsWithChildren } from "react";

interface NewsCarouselControllerProps extends PropsWithChildren {
    activeIndex: number;
    total: number;
    onPrevious: () => void;
    onNext: () => void;
    onHover?: (hovered: boolean) => void;
}

export default function NewsCarouselController(props: NewsCarouselControllerProps) {
    const { activeIndex, total, onPrevious, onNext, onHover, children } = props;

    const isDisabled = total < 2;

    return (
        <Stack
            spacing={1.5}
            sx={{ minWidth: 0, width: "100%" }}
            onMouseEnter={() => onHover?.(true)}
            onMouseLeave={() => onHover?.(false)}
        >
            <Box sx={{ position: "relative", minWidth: 0 }}>
                {children}
                <IconButton
                    size="sm"
                    variant="plain"
                    disabled={isDisabled}
                    onClick={onPrevious}
                    aria-label="Previous post"
                    sx={{
                        position: "absolute",
                        left: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 1,
                        color: "#fff",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                    }}
                >
                    <ChevronLeft />
                </IconButton>
                <IconButton
                    size="sm"
                    variant="plain"
                    disabled={isDisabled}
                    onClick={onNext}
                    aria-label="Next post"
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 1,
                        color: "#fff",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                    }}
                >
                    <ChevronRight />
                </IconButton>
            </Box>

            {total > 1 && (
                <Stack direction="row" justifyContent="center" spacing={0.75}>
                    {Array.from({ length: total }, (_, i) => (
                        <Box
                            key={i}
                            sx={{
                                width: i === activeIndex ? 24 : 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: i === activeIndex
                                    ? "primary.500"
                                    : "neutral.400",
                                opacity: i === activeIndex ? 1 : 0.5,
                                transition: "all 0.3s ease",
                                cursor: "default",
                            }}
                        />
                    ))}
                </Stack>
            )}
        </Stack>
    );
}
