export const TTS_STATUS = {
    NotInstalled: 0,
    CheckingForUpdates: 1,
    Downloading: 2,
    Installing: 3,
    Installed: 4,
    ServerStarting: 5,
    ServerRunning: 6,
    ServerStopped: 7,
    Error: 8,
} as const;

export type TtsStatusCode = (typeof TTS_STATUS)[keyof typeof TTS_STATUS];

export const TTS_STATUS_LABELS: Record<number, string> = {
    [TTS_STATUS.NotInstalled]: "Not installed",
    [TTS_STATUS.CheckingForUpdates]: "Checking for updates",
    [TTS_STATUS.Downloading]: "Downloading",
    [TTS_STATUS.Installing]: "Installing",
    [TTS_STATUS.Installed]: "Installed",
    [TTS_STATUS.ServerStarting]: "Server starting",
    [TTS_STATUS.ServerRunning]: "Server running",
    [TTS_STATUS.ServerStopped]: "Server stopped",
    [TTS_STATUS.Error]: "Error",
};
