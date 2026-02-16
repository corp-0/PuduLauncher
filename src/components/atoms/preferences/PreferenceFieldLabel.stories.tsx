import { Box } from "@mui/joy";
import type { Meta, StoryObj } from "@storybook/react-vite";
import PreferenceFieldLabel from "./PreferenceFieldLabel";

const meta = {
    title: "Atoms/Preferences/PreferenceFieldLabel",
    component: PreferenceFieldLabel,
    parameters: {
        layout: "centered",
    },
    decorators: [
        (Story) => (
            <Box sx={{ p: 2, bgcolor: "background.body", borderRadius: "md" }}>
                <Story />
            </Box>
        ),
    ],
} satisfies Meta<typeof PreferenceFieldLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithTooltip: Story = {
    args: {
        label: "Server list API",
        tooltip: "Endpoint used to fetch the list of available servers.",
    },
};

export const WithoutTooltip: Story = {
    args: {
        label: "Installation path",
    },
};

