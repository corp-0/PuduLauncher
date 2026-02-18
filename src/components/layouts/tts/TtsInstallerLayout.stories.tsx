import { Box } from "@mui/joy";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TTS_STATUS, TTS_STATUS_LABELS } from "../../../constants/ttsStatus";
import TtsInstallerLayout from "./TtsInstallerLayout";

const sampleLogs = [
    "[1/6] Python 3.10.13 (standalone) (python)",
    "[2/6] Virtual environment (venv)",
    "[3/6] Python packages (packages)",
    "[4/6] eSpeak NG (espeak)",
];

const installStepLabels = [
    "Prepare",
    "Python",
    "Environment",
    "Packages",
    "eSpeak-ng",
    "Model",
    "Server",
];

const meta = {
    title: "Layouts/Tts/TtsInstallerLayout",
    component: TtsInstallerLayout,
    parameters: {
        layout: "fullscreen",
    },
    decorators: [
        (Story) => (
            <Box sx={{ minHeight: "100dvh", width: "100%" }}>
                <Story />
            </Box>
        ),
    ],
    args: {
        open: true,
        statusLabel: TTS_STATUS_LABELS[TTS_STATUS.Downloading],
        statusMessage: "Preparing installer download",
        errorMessage: null,
        installLogs: sampleLogs,
        isBusy: true,
        currentStep: 1,
        stepLabels: installStepLabels,
        isComplete: false,
        longStepWarning: null,
        onClose: () => undefined,
    },
} satisfies Meta<typeof TtsInstallerLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Downloading: Story = {};

export const Installing: Story = {
    args: {
        statusLabel: TTS_STATUS_LABELS[TTS_STATUS.Installing],
        statusMessage: "Downloading the TTS model",
        isBusy: true,
        currentStep: 6,
        longStepWarning: "This step can take a few minutes. If it looks stuck, please wait. It's still working",
    },
};

export const Completed: Story = {
    args: {
        statusLabel: TTS_STATUS_LABELS[TTS_STATUS.Installed],
        statusMessage: "HonkTTS installation completed successfully.",
        isBusy: false,
        currentStep: 7,
        isComplete: true,
        longStepWarning: null,
    },
};

export const Failed: Story = {
    args: {
        statusLabel: TTS_STATUS_LABELS[TTS_STATUS.Error],
        statusMessage: "Downloading the TTS model",
        errorMessage: "TTS installer exited with code 1",
        isBusy: false,
        currentStep: 6,
        longStepWarning: "This step can take a few minutes. If it looks stuck, please wait. It's still working",
    },
};
