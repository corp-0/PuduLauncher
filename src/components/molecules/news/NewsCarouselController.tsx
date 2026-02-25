import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/joy";
import type { PropsWithChildren } from "react";

interface NewsCarouselControllerProps extends PropsWithChildren {
    activeIndex: number;
    total: number;
    onPrevious: () => void;
    onNext: () => void;
}

export default function NewsCarouselController(props: NewsCarouselControllerProps) {
    const { activeIndex, total, onPrevious, onNext } = props;

    const isDisabled = total < 2;
    const visibleIndex = total === 0 ? 0 : activeIndex + 1;

    return (
        <Stack spacing={0.75} sx={{ minWidth: 0, width: "100%" }}>
            <Box sx={{ position: "relative", minWidth: 0 }}>
                <Box sx={{ minWidth: 0 }}>
                    {props.children}
                </Box>
                <IconButton
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    disabled={isDisabled}
                    onClick={onPrevious}
                    aria-label="Previous post"
                    sx={{
                        position: "absolute",
                        left: 1,
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 1,
                    }}
                >
                    <ChevronLeft />
                </IconButton>
                <IconButton
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    disabled={isDisabled}
                    onClick={onNext}
                    aria-label="Next post"
                    sx={{
                        position: "absolute",
                        right: 1,
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 1,
                    }}
                >
                    <ChevronRight />
                </IconButton>
            </Box>
            <Typography level="body-sm" sx={{ textAlign: "center", color: "text.secondary" }}>
                {visibleIndex} / {total}
            </Typography>
        </Stack>
    );
}
