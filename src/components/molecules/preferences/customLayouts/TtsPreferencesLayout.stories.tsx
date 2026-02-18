import { Box } from "@mui/joy";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TTS_STATUS } from "../../../../constants/ttsStatus";
import type { Preferences } from "../../../../pudu/generated";
import { TtsPreferencesLayoutView } from "./TtsPreferencesLayout";

const basePreferences: Preferences = {
    version: 1,
    launcher: {
        theme: "Pudu",
    },
    servers: {
        serverListApi: "https://api.example.com/servers",
        serverListFetchIntervalSeconds: 60,
    },
    installations: {
        autoRemove: true,
        installationPath: "C:\\Games\\Pudu\\Installations",
    },
    tts: {
        enabled: true,
        installPath: "C:\\Games\\Pudu\\TTS",
        autoStartOnLaunch: true,
    },
};

const meta = {
    title: "Molecules/Preferences/TtsPreferencesLayout",
    component: TtsPreferencesLayoutView,
    parameters: {
        layout: "centered",
    },
    decorators: [
        (Story) => (
            <Box sx={{ width: 720, maxWidth: "95vw", bgcolor: "background.body", p: 2, borderRadius: "md" }}>
                <Story />
            </Box>
        ),
    ],
    args: {
        categoryKey: "tts",
        preferences: basePreferences,
        updateField: () => undefined,
        isLoadingState: false,
        status: TTS_STATUS.NotInstalled,
        statusMessage: null,
        errorMessage: null,
        isBusy: false,
        canStartServer: false,
        canStopServer: false,
        isInstalled: false,
        onInstall: async () => undefined,
        onCheckForUpdates: async () => undefined,
        onStartServer: async () => undefined,
        onStopServer: async () => undefined,
        onUninstall: async () => undefined,
    },
} satisfies Meta<typeof TtsPreferencesLayoutView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoadingState: Story = {
    args: {
        isLoadingState: true,
        status: null,
    },
};

export const NotInstalledState: Story = {
    args: {
        status: TTS_STATUS.NotInstalled,
        isInstalled: false,
        canStartServer: false,
        canStopServer: false,
    },
};

export const InstallingState: Story = {
    args: {
        status: TTS_STATUS.Installing,
        statusMessage: "Installing runtime dependencies...",
        isBusy: true,
        isInstalled: false,
        canStartServer: false,
        canStopServer: false,
    },
};

export const RunningState: Story = {
    args: {
        status: TTS_STATUS.ServerRunning,
        statusMessage: "TTS server is running",
        isBusy: false,
        isInstalled: true,
        canStartServer: false,
        canStopServer: true,
    },
};

export const ErrorState: Story = {
    args: {
        status: TTS_STATUS.Error,
        statusMessage: "Installer process failed",
        errorMessage: "TTS installer exited with code 1",
        isBusy: false,
        isInstalled: false,
        canStartServer: false,
        canStopServer: false,
    },
};
