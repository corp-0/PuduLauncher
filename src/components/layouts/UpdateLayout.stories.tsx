import { Box } from "@mui/joy";
import type { Meta, StoryObj } from "@storybook/react-vite";
import UpdateLayout from "./UpdateLayout";

const sampleReleaseNotes = "It is here! Feature parity with the old stationhub launcher, but with many extra goodies!\r\n\r\n## What's Changed\r\n* feat: first release of pudulauncher, now with 0% bugs by @corp-0 in [7](https://github.com/corp-0/PuduLauncher/pull/7)\r\n* feat: new HonkTTS and HonkTTS installer. Visually install the TTS server that powers immersive voices in Unitystation.\r\n* fix: TTS installation is no longer a side-effect of downloading a game build. You can manage your installation however you want.\r\n* feat: new onboarding system to have a friendly pudu guide you through new features and things that require your attention.\r\n* feat: new Discord rich presence functionality. If you feel like sharing, your friends on Discord can now see if you are playing and on what server.\r\n\r\n\r\n**Full Changelog**: [Here](https://github.com/corp-0/PuduLauncher/compare/v0.1.1...v1.0.0)"

const meta = {
    title: "Layouts/UpdateLayout",
    component: UpdateLayout,
    parameters: {
        layout: "fullscreen",
    },
    decorators: [
        (Story) => (
            <Box sx={{ minHeight: "100dvh", width: "100%" }}>
                <Story />
            </Box>
        ),
    ],
    args: {
        status: "update-available",
        currentVersion: "0.1.0",
        newVersion: "1.0.0",
        downloadProgress: 0,
        downloadTotal: 0,
        releaseNotes: sampleReleaseNotes,
        canAutoUpdate: true,
        onStartUpdate: () => undefined,
        onOpenReleasesPage: () => undefined,
    },
} satisfies Meta<typeof UpdateLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

// --- Windows stories ---

export const WindowsUpdateAvailable: Story = {
    name: "Windows — Update Available",
};

export const WindowsDownloading: Story = {
    name: "Windows — Downloading",
    args: {
        status: "downloading",
        downloadProgress: 27_262_976,
        downloadTotal: 68_157_440,
    },
};

export const WindowsInstalling: Story = {
    name: "Windows — Installing",
    args: {
        status: "installing",
    },
};

export const WindowsError: Story = {
    name: "Windows — Error",
    args: {
        status: "error",
    },
};

// --- Linux stories ---

export const LinuxUpdateAvailable: Story = {
    name: "Linux — Update Available",
    args: {
        canAutoUpdate: false,
    },
};

export const LinuxError: Story = {
    name: "Linux — Error",
    args: {
        canAutoUpdate: false,
        status: "error",
    },
};

// --- Edge cases ---

export const NoReleaseNotes: Story = {
    name: "No Release Notes",
    args: {
        releaseNotes: null,
    },
};
