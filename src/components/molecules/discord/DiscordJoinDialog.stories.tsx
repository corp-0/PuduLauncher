import type { Meta, StoryObj } from "@storybook/react-vite";
import DiscordJoinDialog from "./DiscordJoinDialog";

const meta = {
    title: "Molecules/Discord/DiscordJoinDialog",
    component: DiscordJoinDialog,
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
    },
    args: {
        open: true,
        serverName: "Pudu Station",
        forkName: "UnityStation",
        buildVersion: 4210,
        gameMode: "Traitor",
        currentMap: "Box Station",
        playerCount: 18,
        playerCountMax: 40,
        accepting: false,
        onAccept: () => undefined,
        onDismiss: () => undefined,
    },
} satisfies Meta<typeof DiscordJoinDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoServerName: Story = {
    args: {
        serverName: null,
    },
};

export const ServerAlmostFull: Story = {
    args: {
        serverName: "Crowded Station",
        playerCount: 38,
        playerCountMax: 40,
    },
};

export const MinimalInfo: Story = {
    args: {
        serverName: null,
        gameMode: null,
        currentMap: null,
        playerCount: 0,
        playerCountMax: 0,
    },
};

export const Accepting: Story = {
    args: {
        accepting: true,
    },
};
