import type {Meta, StoryObj} from '@storybook/react-vite';

import ServerCard from './ServerCard';
import {Box, GlobalStyles} from "@mui/joy";

const meta = {
    component: ServerCard,
    tags: ["autodocs"],
    args: {
        name: "Unitystation - Staging",
        map: "StarshipStation",
        build: "4113",
        mode: "Secret",
        roundTime: "1h 23m",
        playersOnline: 10,
        playerCapacity: 90,
        pingMs: 42,
        actionState: "join",
        progress: null,
    },
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
} satisfies Meta<typeof ServerCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Downloading: Story = {
    args: {
        actionLabel: "Downloading",
        actionState: "downloading",
        progress: {
            label: "Downloading build 4113",
            value: 25,
        },
    },
};

export const DownloadRequired: Story = {
    args: {
        actionLabel: "Download",
        actionState: "download",
    },
};

export const Scanning: Story = {
    args: {
        actionLabel: "Scanning",
        actionState: "scanning",
        progress: {
            label: "Scanning files",
            value: 78,
        },
    },
};

export const ScanningFailed: Story = {
    args: {
        actionLabel: "Scanning Failed",
        actionState: "scanningFailed",
        progress: {
            label: "Scan failed",
            value: 100,
        },
    },
};
