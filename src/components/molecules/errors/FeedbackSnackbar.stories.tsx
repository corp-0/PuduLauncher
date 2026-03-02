import type { Meta, StoryObj } from "@storybook/react-vite";

import FeedbackSnackbar from "./FeedbackSnackbar";

const meta = {
    title: "Molecules/Feedback/FeedbackSnackbar",
    component: FeedbackSnackbar,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
    },
    args: {
        snackbar: {
            id: "1",
            severity: "error",
            message: "Unable to refresh server list.",
            detail: "SERVERS_FETCH_FAILED",
        },
        autoHideDuration: 60_000,
        onClose: () => undefined,
    },
} satisfies Meta<typeof FeedbackSnackbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Error: Story = {};

export const ErrorWithSeeLogs: Story = {
    args: {
        onSeeLogs: () => undefined,
    },
};

export const Success: Story = {
    args: {
        snackbar: {
            id: "2",
            severity: "success",
            message: "Settings saved successfully.",
        },
    },
};

export const Info: Story = {
    args: {
        snackbar: {
            id: "3",
            severity: "info",
            message: "A new update is available.",
            detail: "Version 2.1.0",
        },
    },
};

export const Warning: Story = {
    args: {
        snackbar: {
            id: "4",
            severity: "warning",
            message: "Pudus are an endangered species",
        },
    },
};

export const SuccessWithDetail: Story = {
    args: {
        snackbar: {
            id: "5",
            severity: "success",
            message: "Backup completed successfully.",
            detail: "Backup size: 1.2 GB",
        },
    },
};

export const Closed: Story = {
    args: {
        snackbar: null,
    },
};
