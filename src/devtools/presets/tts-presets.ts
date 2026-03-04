export interface PresetMock {
    endpoint: string;
    response: unknown;
}

export interface EventPreset {
    label: string;
    description: string;
    /** Mocks to set up before firing events (prevents backend refetch from overriding injected state) */
    mocks?: PresetMock[];
    events: Array<{
        eventType: string;
        data: Record<string, unknown>;
        delayMs?: number;
    }>;
}

const now = () => new Date().toISOString();

export const ttsPresets: EventPreset[] = [
    {
        label: "Status \u2192 NotInstalled",
        description: "Set TTS status to NotInstalled",
        mocks: [{ endpoint: "/api/tts/get-status", response: { success: true, data: { status: 0, updateAvailable: false } } }],
        events: [
            { eventType: "tts:status-changed", data: { eventType: "tts:status-changed", timestamp: now(), status: 0, message: null } },
        ],
    },
    {
        label: "Status \u2192 Installed",
        description: "Set TTS status to Installed",
        mocks: [{ endpoint: "/api/tts/get-status", response: { success: true, data: { status: 4, updateAvailable: false, installedVersion: "1.0.0" } } }],
        events: [
            { eventType: "tts:status-changed", data: { eventType: "tts:status-changed", timestamp: now(), status: 4, message: "Installation complete" } },
        ],
    },
    {
        label: "Status \u2192 ServerRunning",
        description: "Set TTS status to ServerRunning",
        events: [
            { eventType: "tts:status-changed", data: { eventType: "tts:status-changed", timestamp: now(), status: 6, message: "Server started" } },
        ],
    },
    {
        label: "Status \u2192 Error",
        description: "Set TTS status to Error with a message",
        mocks: [{ endpoint: "/api/tts/get-status", response: { success: true, data: { status: 8, updateAvailable: false, errorMessage: "Something went wrong" } } }],
        events: [
            { eventType: "tts:status-changed", data: { eventType: "tts:status-changed", timestamp: now(), status: 8, message: "Something went wrong" } },
        ],
    },
    {
        label: "Update Available",
        description: "Trigger update available notification",
        events: [
            { eventType: "tts:update-available", data: { eventType: "tts:update-available", timestamp: now(), installedVersion: "1.0.0", latestVersion: "1.0.2" } },
        ],
    },
    {
        label: "Simulate Install Flow",
        description: "Full install sequence: Downloading \u2192 Installing \u2192 output lines \u2192 Installed",
        mocks: [{ endpoint: "/api/tts/get-status", response: { success: true, data: { status: 4, updateAvailable: false, installedVersion: "1.0.0" } } }],
        events: [
            { eventType: "tts:status-changed", data: { eventType: "tts:status-changed", timestamp: now(), status: 2, message: "Downloading..." } },
            { eventType: "tts:status-changed", data: { eventType: "tts:status-changed", timestamp: now(), status: 3, message: "Installing..." }, delayMs: 1500 },
            { eventType: "tts:install-output", data: { eventType: "tts:install-output", timestamp: now(), line: "[1 / 6] Checking Python installation..." }, delayMs: 500 },
            { eventType: "tts:install-output", data: { eventType: "tts:install-output", timestamp: now(), line: "[2 / 6] Creating virtual environment..." }, delayMs: 1000 },
            { eventType: "tts:install-output", data: { eventType: "tts:install-output", timestamp: now(), line: "[3 / 6] Installing requirements..." }, delayMs: 1000 },
            { eventType: "tts:install-output", data: { eventType: "tts:install-output", timestamp: now(), line: "[4 / 6] Installing eSpeak..." }, delayMs: 2000 },
            { eventType: "tts:install-output", data: { eventType: "tts:install-output", timestamp: now(), line: "[5 / 6] Downloading TTS model..." }, delayMs: 1500 },
            { eventType: "tts:install-output", data: { eventType: "tts:install-output", timestamp: now(), line: "[6 / 6] Writing manifest..." }, delayMs: 1000 },
            { eventType: "tts:status-changed", data: { eventType: "tts:status-changed", timestamp: now(), status: 4, message: "Installation complete" }, delayMs: 500 },
        ],
    },
];
