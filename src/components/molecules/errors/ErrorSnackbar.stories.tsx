import type { Meta, StoryObj } from "@storybook/react-vite";

import ErrorSnackbar from "./ErrorSnackbar";

const meta = {
    title: "Molecules/Errors/ErrorSnackbar",
    component: ErrorSnackbar,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
    },
    args: {
        error: {
            userMessage: "Unable to refresh server list.",
            code: "SERVERS_FETCH_FAILED",
        },
        autoHideDuration: 60_000,
        onClose: () => undefined,
    },
} satisfies Meta<typeof ErrorSnackbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutCode: Story = {
    args: {
        error: {
            userMessage: "Unexpected error while joining the server.",
        },
    },
};

export const Closed: Story = {
    args: {
        error: null,
    },
};
