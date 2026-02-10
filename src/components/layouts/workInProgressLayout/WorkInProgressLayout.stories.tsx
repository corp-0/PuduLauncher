import type {Meta, StoryObj} from "@storybook/react-vite";
import WorkInProgressLayout from "./WorkInProgressLayout.tsx";
import {Box, GlobalStyles} from "@mui/joy";


const meta = {
    title: "Layouts/WorkInProgressLayout",
    component: WorkInProgressLayout,
    parameters: {
        layout: "fullscreen",
    },
    decorators: [
        (Story) => (
            <>
                <GlobalStyles styles={{
                    "html, body, #storybook-root": {
                        backgroundColor: "background.surface",
                    },
                }}/>
                <Box sx={{
                    bgcolor: "background.surface",
                    width: "100%",
                    minHeight: "100dvh",
                }}>
                    <Story/>
                </Box>
            </>
        ),
    ]
} satisfies Meta<typeof WorkInProgressLayout>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};