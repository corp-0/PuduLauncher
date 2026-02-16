import { Box } from "@mui/joy";
import type { Meta, StoryObj } from "@storybook/react-vite";
import PreferenceInputFieldRow from "./PreferenceInputFieldRow";

const meta = {
    title: "Molecules/Preferences/PreferenceInputFieldRow",
    component: PreferenceInputFieldRow,
    parameters: {
        layout: "centered",
    },
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
} satisfies Meta<typeof PreferenceInputFieldRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Text: Story = {
    args: {
        label: "Server list API",
        tooltip: "Endpoint used to fetch the list of available servers.",
        type: "text",
        value: "https://api.example.com/servers",
    },
};

export const Number: Story = {
    args: {
        label: "Fetch interval (seconds)",
        tooltip: "How often the launcher refreshes server data from the API.",
        type: "number",
        value: 60,
    },
};

