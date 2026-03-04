import { Box } from "@mui/joy";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { TTS_STATUS } from "../../../../constants/ttsStatus";
import {
    type TtsPreferencesContextValue,
    TtsPreferencesTestProvider,
} from "../../../../contextProviders/TtsPreferencesContextProvider";
import type { Preferences } from "../../../../pudu/generated";
import TtsPreferencesLayout from "./TtsPreferencesLayout";

const basePreferences: Preferences = {
    version: 1,
    launcher: {
        theme: "Pudu",
        enableDiscordRichPresence: true,
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

const defaultContextValue: TtsPreferencesContextValue = {
    isLoadingState: false,
    status: TTS_STATUS.NotInstalled,
    statusMessage: null,
    errorMessage: null,
    isBusy: false,
    canStartServer: false,
    canStopServer: false,
    isInstalled: false,
    updateAvailable: false,
    latestVersion: null,
    runCommand: async () => {},
};

const meta = {
    title: "Molecules/Preferences/TtsPreferencesLayout",
    component: TtsPreferencesLayout,
    parameters: {
        layout: "centered",
    },
    decorators: [
        (Story, context) => (
            <TtsPreferencesTestProvider value={{ ...defaultContextValue, ...context.args.contextValue }}>
                <Box sx={{ width: 720, maxWidth: "95vw", bgcolor: "background.body", p: 2, borderRadius: "md" }}>
                    <Story />
                </Box>
            </TtsPreferencesTestProvider>
        ),
    ],
    args: {
        categoryKey: "tts",
        preferences: basePreferences,
        updateField: () => undefined,
        contextValue: defaultContextValue,
    },
} satisfies Meta<ComponentProps<typeof TtsPreferencesLayout> & { contextValue: TtsPreferencesContextValue }>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoadingState: Story = {
    args: {
        contextValue: {
            ...defaultContextValue,
            isLoadingState: true,
            status: null,
        },
    },
};

export const NotInstalledState: Story = {
    args: {
        contextValue: {
            ...defaultContextValue,
            status: TTS_STATUS.NotInstalled,
        },
    },
};

export const InstallingState: Story = {
    args: {
        contextValue: {
            ...defaultContextValue,
            status: TTS_STATUS.Installing,
            statusMessage: "Installing runtime dependencies...",
            isBusy: true,
        },
    },
};

export const RunningState: Story = {
    args: {
        contextValue: {
            ...defaultContextValue,
            status: TTS_STATUS.ServerRunning,
            statusMessage: "TTS server is running",
            isInstalled: true,
            canStopServer: true,
        },
    },
};

export const UpdateAvailable: Story = {
    args: {
        contextValue: {
            ...defaultContextValue,
            status: TTS_STATUS.Installed,
            isInstalled: true,
            updateAvailable: true,
            latestVersion: "1.0.1",
            canStartServer: true,
        },
    },
};

export const ErrorState: Story = {
    args: {
        contextValue: {
            ...defaultContextValue,
            status: TTS_STATUS.Error,
            statusMessage: "Installer process failed",
            errorMessage: "TTS installer exited with code 1",
        },
    },
};
