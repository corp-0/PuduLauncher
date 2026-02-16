import { Box } from "@mui/joy";
import type { Meta, StoryObj } from "@storybook/react-vite";
import PreferencePathFieldRow from "./PreferencePathFieldRow";

const meta = {
    title: "Molecules/Preferences/PreferencePathFieldRow",
    component: PreferencePathFieldRow,
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
        label: "Installation path",
        tooltip: "Base folder where downloaded server builds are installed.",
        value: "C:\\Games\\Pudu\\Installations",
        onChange: () => undefined,
    },
} satisfies Meta<typeof PreferencePathFieldRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

