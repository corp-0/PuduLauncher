import {Message, Public} from "@mui/icons-material";
import {Box, Stack} from "@mui/joy";
import type {Meta, StoryObj} from "@storybook/react-vite";
import SideBarExternalLink from "./SideBarExternalLink";

const meta = {
    title: "Molecules/SideBar/SideBarExternalLink",
    component: SideBarExternalLink,
    parameters: {
        layout: "centered",
    },
    decorators: [
        (Story) => (
            <Box sx={{bgcolor: "background.body", p: 2, borderRadius: "sm"}}>
                <Stack direction="row" gap={2}>
                    <Story/>
                </Stack>
            </Box>
        ),
    ],
    args: {
        onClick: () => {
        },
    },
} satisfies Meta<typeof SideBarExternalLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Website: Story = {
    args: {
        tooltip: "Unitystation's website",
        icon: <Public/>,
    },
};

export const Discord: Story = {
    args: {
        tooltip: "Unitystation's Discord",
        icon: <Message/>,
    },
};
