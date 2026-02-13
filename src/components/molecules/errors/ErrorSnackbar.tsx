import {
    Snackbar,
    Stack,
    Typography,
} from "@mui/joy";

export interface ErrorSnackbarContent {
    userMessage: string;
    code?: string | null;
}

export interface ErrorSnackbarProps {
    error: ErrorSnackbarContent | null;
    autoHideDuration?: number;
    onClose: () => void;
}

export default function ErrorSnackbar(props: ErrorSnackbarProps) {
    const {
        error,
        autoHideDuration = 6_000,
        onClose,
    } = props;

    return (
        <Snackbar
            open={error !== null}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            color="danger"
            variant="soft"
        >
            <Stack spacing={0.25}>
                <Typography level="body-sm" fontWeight="lg">
                    {error?.userMessage}
                </Typography>
                {error?.code && (
                    <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                        {error.code}
                    </Typography>
                )}
            </Stack>
        </Snackbar>
    );
}
