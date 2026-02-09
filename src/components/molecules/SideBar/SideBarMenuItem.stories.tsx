import {Newspaper, VideogameAsset} from "@mui/icons-material";
import {Box, List} from "@mui/joy";
import type {Meta, StoryObj} from "@storybook/react-vite";
import SideBarMenuItem from "./SideBarMenuItem";

const meta = {
    title: "Molecules/SideBar/SideBarMenuItem",
    component: SideBarMenuItem,
    parameters: {
        layout: "centered",
    },
    decorators: [
        (Story) => (
            <Box sx={{width: 320, bgcolor: "background.body", p: 1, borderRadius: "sm"}}>
                <List sx={{gap: 1}}>
                    <Story/>
                </List>
            </Box>
        ),
    ],
    args: {
        onClick: () => {
        },
    },
} satisfies Meta<typeof SideBarMenuItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Inactive: Story = {
    args: {
        icon: <Newspaper/>,
        text: "News",
        isActive: false,
    },
};

export const Active: Story = {
    args: {
        icon: <VideogameAsset/>,
        text: "Servers",
        isActive: true,
    },
};
