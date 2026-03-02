import { useRef } from "react";
import {
    Button,
    type ColorPaletteProp,
    Snackbar,
    Stack,
    Typography,
} from "@mui/joy";
import type { SnackbarItem, SnackbarSeverity } from "../../../contextProviders/FeedbackContextProvider";

const severityColorMap: Record<SnackbarSeverity, ColorPaletteProp> = {
    error: "danger",
    warning: "warning",
    success: "success",
    info: "primary",
};

export interface FeedbackSnackbarProps {
    snackbar: SnackbarItem | null;
    autoHideDuration?: number;
    onClose: () => void;
    onSeeLogs?: () => void;
}

export default function FeedbackSnackbar(props: FeedbackSnackbarProps) {
    const {
        snackbar,
        autoHideDuration = 6_000,
        onClose,
        onSeeLogs,
    } = props;

    // Keep last displayed item in a ref so color and content stay correct
    // during the exit animation (when snackbar becomes null but the Snackbar
    // component is still visible and animating out).
    const lastSnackbarRef = useRef<SnackbarItem | null>(null);

    if (snackbar !== null) {
        lastSnackbarRef.current = snackbar;
    }

    const displayed = snackbar ?? lastSnackbarRef.current;
    const color = displayed ? severityColorMap[displayed.severity] : "danger";
    const showSeeLogs = displayed?.severity === "error" && onSeeLogs;

    const handleUnmount = () => {
        lastSnackbarRef.current = null;
    };

    return (
        <Snackbar
            open={snackbar !== null}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            onUnmount={handleUnmount}
            color={color}
            variant="soft"
            invertedColors
            endDecorator={
                showSeeLogs && (
                    <Button
                        size="sm"
                        variant="outlined"
                        color={color}
                        onClick={onSeeLogs}
                    >
                        See logs
                    </Button>
                )
            }
        >
            <Stack spacing={0.25}>
                <Typography level="body-sm" fontWeight="lg">
                    {displayed?.message}
                </Typography>
                {displayed?.detail && (
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                        {displayed.detail}
                    </Typography>
                )}
            </Stack>
        </Snackbar>
    );
}
