import { Alert, Box, Button, Modal, ModalDialog, Stack, Typography } from "@mui/joy";
import { useEffect, useRef } from "react";
import PuduStepper from "../../organisms/common/PuduStepper";

interface TtsInstallerLayoutProps {
    open: boolean;
    statusLabel: string;
    statusMessage?: string | null;
    errorMessage?: string | null;
    installLogs: string[];
    isBusy: boolean;
    currentStep: number;
    stepLabels: string[];
    isComplete?: boolean;
    longStepWarning?: string | null;
    onClose: () => void;
}

export default function TtsInstallerLayout(props: TtsInstallerLayoutProps) {
    const {
        open,
        statusLabel,
        statusMessage,
        errorMessage,
        installLogs,
        isBusy,
        currentStep,
        stepLabels,
        isComplete,
        longStepWarning,
        onClose,
    } = props;
    const logContainerRef = useRef<HTMLPreElement | null>(null);

    useEffect(() => {
        if (!open || logContainerRef.current === null) {
            return;
        }

        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }, [installLogs, open]);

    return (
        <Modal open={open}>
            <ModalDialog layout="fullscreen">
                <Stack spacing={2} sx={{ width: "100%", height: "100%", minHeight: 0 }}>
                    <Stack spacing={0.5}>
                        <Typography level="h2">HonkTTS Installer</Typography>
                        <Typography level="body-sm" color="neutral">
                            Installing and configuring immersive voices.
                        </Typography>
                    </Stack>

                    <PuduStepper
                        maxSteps={stepLabels.length}
                        currentStep={currentStep}
                        stepLabels={stepLabels}
                        isComplete={isComplete}
                    />

                    {(statusMessage || statusLabel) && (
                        <Typography level="body-md" color="neutral">
                            {statusMessage ?? statusLabel}
                        </Typography>
                    )}

                    {longStepWarning && (
                        <Alert color="warning" variant="soft">
                            {longStepWarning}
                        </Alert>
                    )}

                    {errorMessage && (
                        <Alert color="danger" variant="soft">
                            {errorMessage}
                        </Alert>
                    )}

                    <Typography level="title-sm">Installer output</Typography>
                    <Box
                        component="pre"
                        ref={logContainerRef}
                        sx={{
                            m: 0,
                            p: 1.5,
                            flex: 1,
                            minHeight: 0,
                            overflow: "auto",
                            borderRadius: "sm",
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.level1",
                            fontFamily: "monospace",
                            fontSize: "0.75rem",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {installLogs.length > 0
                            ? installLogs.join("\n")
                            : "Waiting for installer output..."}
                    </Box>

                    <Stack direction="row" justifyContent="flex-end" sx={{ pt: 1 }}>
                        <Button onClick={onClose} disabled={isBusy}>
                            {isBusy ? "Installing..." : "Close"}
                        </Button>
                    </Stack>
                </Stack>
            </ModalDialog>
        </Modal>
    );
}
