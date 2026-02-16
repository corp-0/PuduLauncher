import { Box } from "@mui/joy";
import type { Meta, StoryObj } from "@storybook/react-vite";
import PreferenceToggleFieldRow from "./PreferenceToggleFieldRow";

const meta = {
    title: "Molecules/Preferences/PreferenceToggleFieldRow",
    component: PreferenceToggleFieldRow,
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
        label: "Clean up old builds",
        tooltip: "When enabled, older builds from the same fork are deleted after installing a newer one.",
    },
} satisfies Meta<typeof PreferenceToggleFieldRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Enabled: Story = {
    args: {
        value: true,
    },
};

export const Disabled: Story = {
    args: {
        value: false,
    },
};

