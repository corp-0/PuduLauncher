import { Box } from "@mui/joy";
import type { Meta, StoryObj } from "@storybook/react-vite";
import PreferenceSelectFieldRow from "./PreferenceSelectFieldRow";

const meta = {
    title: "Molecules/Preferences/PreferenceSelectFieldRow",
    component: PreferenceSelectFieldRow,
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
        label: "Theme",
        tooltip: "Choose the launcher theme.",
        value: "Pudu",
        options: ["Pudu", "Forest", "Nordic"],
        onChange: () => undefined,
    },
} satisfies Meta<typeof PreferenceSelectFieldRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutOptions: Story = {
    args: {
        options: [],
        value: "",
    },
};

