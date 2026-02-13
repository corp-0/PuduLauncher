import type { Meta, StoryObj } from "@storybook/react-vite";

import FatalErrorModal from "./FatalErrorModal";

const trace = [
    "Time: 2026-02-13T15:05:21.123Z",
    "Severity: fatal",
    "Source: frontend.unhandled-rejection",
    "Code: FRONTEND_UNHANDLED_REJECTION",
    "CorrelationId: n/a",
    "Message: Unhandled promise rejection.",
    "",
    "Technical details:",
    "Error: Request timed out while loading initial data",
].join("\n");

const meta = {
    title: "Molecules/Errors/FatalErrorModal",
    component: FatalErrorModal,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
    },
    args: {
        error: {
            source: "frontend.unhandled-rejection",
            userMessage: "Unhandled promise rejection.",
            code: "FRONTEND_UNHANDLED_REJECTION",
            correlationId: null,
            timestamp: "2026-02-13T15:05:21.123Z",
        },
        trace,
        copyFeedback: null,
        onCopyTrace: () => undefined,
        onDismiss: () => undefined,
    },
} satisfies Meta<typeof FatalErrorModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCopyFeedback: Story = {
    args: {
        copyFeedback: "Trace copied",
    },
};

export const Closed: Story = {
    args: {
        error: null,
        trace: "",
    },
};
