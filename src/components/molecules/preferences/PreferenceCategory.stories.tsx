import { Box } from "@mui/joy";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Preferences } from "../../../pudu/generated";
import { preferencesSchema } from "../../../pudu/generated";
import PreferenceCategory from "./PreferenceCategory";

const mockPreferences: Preferences = {
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
        enabled: false,
        installPath: "C:\\Games\\Pudu\\TTS",
        autoStartOnLaunch: true,
    },
};

const noopUpdateField = () => undefined;

const getCategoryByKey = (key: string) => {
    const category = preferencesSchema.find((schema) => schema.key === key);
    if (!category) {
        throw new Error(`Category '${key}' not found in preferencesSchema`);
    }
    return category;
};

const meta = {
    title: "Molecules/Preferences/PreferenceCategory",
    component: PreferenceCategory,
    parameters: {
        layout: "centered",
    },
    decorators: [
        (Story) => (
            <Box sx={{ width: 560, maxWidth: "95vw", bgcolor: "background.body", p: 2, borderRadius: "md" }}>
                <Story />
            </Box>
        ),
    ],
    args: {
        preferences: mockPreferences,
        updateField: noopUpdateField,
    },
} satisfies Meta<typeof PreferenceCategory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LauncherCategory: Story = {
    args: {
        schema: getCategoryByKey("launcher"),
    },
};

export const ServersCategory: Story = {
    args: {
        schema: getCategoryByKey("servers"),
    },
};

export const InstallationsCategory: Story = {
    args: {
        schema: getCategoryByKey("installations"),
    },
};

export const TtsCategoryLayout: Story = {
    args: {
        schema: getCategoryByKey("tts"),
    },
};
