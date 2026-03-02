import { Box } from "@mui/joy";
import type { Meta, StoryObj } from "@storybook/react-vite";
import UpdateLayout from "./UpdateLayout";

const sampleReleaseNotes = `- Fixed crash when launching multiple servers simultaneously
- Added support for custom TTS voices
- Improved startup performance
- Updated dependencies for security patches`;

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
