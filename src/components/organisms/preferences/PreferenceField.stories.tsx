import { Box } from "@mui/joy";
import type { Meta, StoryObj } from "@storybook/react-vite";
import PreferenceField from "./PreferenceField";

const meta = {
    title: "Organisms/Preferences/PreferenceField",
    component: PreferenceField,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <Box sx={{ width: 480, maxWidth: "90vw", bgcolor: "background.body", p: 2, borderRadius: "md" }}>
                <Story />
            </Box>
        ),
    ],
    args: {
        onChange: () => undefined,
    },
} satisfies Meta<typeof PreferenceField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Text: Story = {
    args: {
        schema: {
            key: "serverListApi",
            label: "Server list API",
            component: "text",
            tooltip: "Endpoint used to fetch the list of available servers.",
        },
        value: "https://api.example.com/servers",
    },
};

export const Number: Story = {
    args: {
        schema: {
            key: "serverListFetchIntervalSeconds",
            label: "Fetch interval (seconds)",
            component: "number",
            tooltip: "How often the launcher refreshes server data from the API.",
        },
        value: 60,
    },
};

export const ToggleOn: Story = {
    args: {
        schema: {
            key: "autoRemove",
            label: "Clean up old builds",
            component: "toggle",
            tooltip: "When enabled, older builds from the same fork are deleted after installing a newer one.",
        },
        value: true,
    },
};

export const ToggleOff: Story = {
    args: {
        schema: {
            key: "autoRemove",
            label: "Clean up old builds",
            component: "toggle",
            tooltip: "When enabled, older builds from the same fork are deleted after installing a newer one.",
        },
        value: false,
    },
};

export const Path: Story = {
    args: {
        schema: {
            key: "installationPath",
            label: "Installation path",
            component: "path",
            tooltip: "Base folder where downloaded server builds are installed.",
        },
        value: "C:\\Games\\Pudu\\Installations",
    },
};

export const Select: Story = {
    args: {
        schema: {
            key: "theme",
            label: "Theme",
            component: "select",
            tooltip: "Choose the launcher theme.",
            options: ["Pudu", "Forest", "Nordic"],
        },
        value: "Pudu",
    },
};
