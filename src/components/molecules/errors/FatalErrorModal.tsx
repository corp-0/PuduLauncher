import {
    Alert,
    Box,
    Button,
    Modal,
    ModalDialog,
    Stack,
    Typography,
} from "@mui/joy";

export interface FatalErrorModalItem {
    source: string;
    userMessage: string;
    code?: string | null;
    correlationId?: string | null;
    timestamp: string;
}

export interface FatalErrorModalProps {
    error: FatalErrorModalItem | null;
    trace: string;
    copyFeedback?: string | null;
    onCopyTrace: () => void | Promise<void>;
    onDismiss: () => void;
}

export default function FatalErrorModal(props: FatalErrorModalProps) {
    const {
        error,
        trace,
        copyFeedback,
        onCopyTrace,
        onDismiss,
    } = props;

    return (
        <Modal open={error !== null}>
            <ModalDialog layout="fullscreen" sx={{ p: 3 }}>
                <Stack spacing={2} sx={{ height: "100%" }}>
                    <Typography level="h2">
                        Fatal error
                    </Typography>

                    <Alert color="danger" variant="soft">
                        {error?.userMessage}
                    </Alert>

                    <Stack spacing={0.5}>
                        <Typography level="body-sm">
                            Source: {error?.source}
                        </Typography>
                        <Typography level="body-sm">
                            Time: {error ? new Date(error.timestamp).toLocaleString() : ""}
                        </Typography>
                        {error?.code && (
                            <Typography level="body-sm">
                                Code: {error.code}
                            </Typography>
                        )}
                        {error?.correlationId && (
                            <Typography level="body-sm">
                                Correlation: {error.correlationId}
                            </Typography>
                        )}
                    </Stack>

                    <Box
                        component="pre"
                        sx={{
                            p: 2,
                            m: 0,
                            borderRadius: "sm",
                            bgcolor: "background.level1",
                            overflow: "auto",
                            flex: 1,
                            fontSize: 12,
                        }}
                    >
                        {trace}
                    </Box>

                    <Stack direction="row" spacing={1}>
                        <Button onClick={() => void onCopyTrace()}>
                            Copy trace
                        </Button>
                        <Button variant="outlined" onClick={onDismiss}>
                            Dismiss
                        </Button>
                        {copyFeedback && (
                            <Typography level="body-sm" sx={{ alignSelf: "center" }}>
                                {copyFeedback}
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            </ModalDialog>
        </Modal>
    );
}
