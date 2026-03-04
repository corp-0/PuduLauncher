import "@fontsource/inter";
import { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Chip,
    CssBaseline,
    CssVarsProvider,
    FormControl,
    FormLabel,
    GlobalStyles,
    Input,
    Option,
    Select,
    Sheet,
    Stack,
    Tab,
    TabList,
    Tabs,
    Textarea,
    Typography,
} from "@mui/joy";
import { themeRegistry, themeScrollbarRegistry } from "../themes";
import { useDevToolsChannel, type DevToolsChannelActions, type DevToolsChannelState } from "./use-devtools-channel";
import type { RequestLogEntry } from "./protocol";
import { ttsPresets, type EventPreset } from "./presets/tts-presets";

function RequestLogRow({ entry }: { entry: RequestLogEntry }) {
    const [expanded, setExpanded] = useState(false);

    const time = new Date(entry.timestamp).toLocaleTimeString();
    const hasError = entry.error !== null;

    return (
        <Sheet
            variant="outlined"
            sx={{
                p: 1,
                borderRadius: "sm",
                cursor: "pointer",
                borderLeftWidth: 3,
                borderLeftColor: hasError
                    ? "danger.400"
                    : entry.wasMocked
                      ? "success.400"
                      : "neutral.400",
            }}
            onClick={() => setExpanded(!expanded)}
        >
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography level="body-xs" fontFamily="monospace" sx={{ minWidth: 70 }}>
                    {time}
                </Typography>
                <Chip size="sm" variant="soft" color="neutral">
                    {entry.method}
                </Chip>
                <Typography level="body-sm" fontFamily="monospace" sx={{ flex: 1 }} noWrap>
                    {entry.endpoint}
                </Typography>
                <Button
                    size="sm"
                    variant="plain"
                    color="neutral"
                    sx={{ minWidth: "auto", px: 0.5, fontSize: 11 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        void navigator.clipboard.writeText(entry.endpoint);
                    }}
                >
                    Copy URL
                </Button>
                {entry.wasMocked && (
                    <Chip size="sm" variant="soft" color="success">
                        mocked
                    </Chip>
                )}
                {hasError && (
                    <Chip size="sm" variant="soft" color="danger">
                        {entry.error}
                    </Chip>
                )}
                {entry.durationMs !== null && !entry.wasMocked && (
                    <Typography level="body-xs" color="neutral">
                        {entry.durationMs}ms
                    </Typography>
                )}
            </Stack>
            {expanded && (
                <Box sx={{ mt: 1 }}>
                    {entry.requestBody !== null && (
                        <Box sx={{ mb: 1 }}>
                            <Typography level="body-xs" fontWeight="bold">Request Body</Typography>
                            <Sheet variant="soft" sx={{ p: 1, borderRadius: "sm", overflow: "auto", maxHeight: 200 }}>
                                <pre style={{ margin: 0, fontSize: 11, whiteSpace: "pre-wrap" }}>
                                    {JSON.stringify(entry.requestBody, null, 2)}
                                </pre>
                            </Sheet>
                        </Box>
                    )}
                    {entry.responseBody !== null && (
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography level="body-xs" fontWeight="bold">Response Body</Typography>
                                <Button
                                    size="sm"
                                    variant="plain"
                                    color="neutral"
                                    sx={{ minWidth: "auto", px: 0.5, fontSize: 11 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        void navigator.clipboard.writeText(JSON.stringify(entry.responseBody, null, 2));
                                    }}
                                >
                                    Copy
                                </Button>
                            </Stack>
                            <Sheet variant="soft" sx={{ p: 1, borderRadius: "sm", overflow: "auto", maxHeight: 200 }}>
                                <pre style={{ margin: 0, fontSize: 11, whiteSpace: "pre-wrap" }}>
                                    {JSON.stringify(entry.responseBody, null, 2)}
                                </pre>
                            </Sheet>
                        </Box>
                    )}
                </Box>
            )}
        </Sheet>
    );
}

function LogTab({ requestLog, clearLog }: Pick<DevToolsChannelState, "requestLog"> & Pick<DevToolsChannelActions, "clearLog">) {
    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography level="title-sm">
                    {requestLog.length} request{requestLog.length !== 1 ? "s" : ""}
                </Typography>
                <Button size="sm" variant="plain" onClick={clearLog}>
                    Clear
                </Button>
            </Stack>
            <Stack spacing={0.5}>
                {requestLog.length === 0 && (
                    <Typography level="body-sm" color="neutral" sx={{ textAlign: "center", py: 4 }}>
                        No requests logged yet. Interact with the app to see requests here.
                    </Typography>
                )}
                {requestLog.map((entry) => (
                    <RequestLogRow key={entry.id} entry={entry} />
                ))}
            </Stack>
        </Box>
    );
}

interface MocksTabProps {
    mocks: DevToolsChannelState["mocks"];
    addMock: DevToolsChannelActions["addMock"];
    removeMock: DevToolsChannelActions["removeMock"];
    clearAllMocks: DevToolsChannelActions["clearAllMocks"];
}

function MocksTab({ mocks, addMock, removeMock, clearAllMocks }: MocksTabProps) {
    const [endpoint, setEndpoint] = useState("");
    const [responseJson, setResponseJson] = useState("");
    const [jsonError, setJsonError] = useState<string | null>(null);

    const handleAdd = () => {
        const trimmed = endpoint.trim();
        if (!trimmed) return;

        try {
            const parsed = JSON.parse(responseJson);
            setJsonError(null);
            addMock(trimmed, parsed);
            setEndpoint("");
            setResponseJson("");
        } catch (e) {
            setJsonError(e instanceof Error ? e.message : "Invalid JSON");
        }
    };

    return (
        <Box>
            <Sheet variant="outlined" sx={{ p: 1.5, borderRadius: "sm", mb: 2 }}>
                <Typography level="title-sm" sx={{ mb: 1 }}>Add Mock</Typography>
                <Stack spacing={1}>
                    <FormControl size="sm">
                        <FormLabel>Endpoint</FormLabel>
                        <Input
                            placeholder="/api/tts/get-status"
                            value={endpoint}
                            onChange={(e) => setEndpoint(e.target.value)}
                            sx={{ fontFamily: "monospace" }}
                        />
                    </FormControl>
                    <FormControl size="sm" error={jsonError !== null}>
                        <FormLabel>Response JSON</FormLabel>
                        <Textarea
                            minRows={3}
                            maxRows={8}
                            placeholder='{ "success": true, "data": { ... } }'
                            value={responseJson}
                            onChange={(e) => {
                                setResponseJson(e.target.value);
                                setJsonError(null);
                            }}
                            sx={{ fontFamily: "monospace", fontSize: 12 }}
                        />
                        {jsonError && (
                            <Typography level="body-xs" color="danger">{jsonError}</Typography>
                        )}
                    </FormControl>
                    <Button size="sm" onClick={handleAdd} disabled={!endpoint.trim() || !responseJson.trim()}>
                        Add Mock
                    </Button>
                </Stack>
            </Sheet>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography level="title-sm">
                    {mocks.length} active mock{mocks.length !== 1 ? "s" : ""}
                </Typography>
                {mocks.length > 0 && (
                    <Button size="sm" variant="plain" color="danger" onClick={clearAllMocks}>
                        Clear All
                    </Button>
                )}
            </Stack>

            <Stack spacing={0.5}>
                {mocks.length === 0 && (
                    <Typography level="body-sm" color="neutral" sx={{ textAlign: "center", py: 4 }}>
                        No active mocks. Add one above to intercept requests.
                    </Typography>
                )}
                {mocks.map((mock) => (
                    <Sheet key={mock.endpoint} variant="outlined" sx={{ p: 1, borderRadius: "sm" }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography level="body-sm" fontFamily="monospace">
                                {mock.endpoint}
                            </Typography>
                            <Button size="sm" variant="plain" color="danger" onClick={() => removeMock(mock.endpoint)}>
                                Remove
                            </Button>
                        </Stack>
                        <Sheet variant="soft" sx={{ p: 0.5, borderRadius: "sm", mt: 0.5, overflow: "auto", maxHeight: 100 }}>
                            <pre style={{ margin: 0, fontSize: 11, whiteSpace: "pre-wrap" }}>
                                {JSON.stringify(mock.response, null, 2)}
                            </pre>
                        </Sheet>
                    </Sheet>
                ))}
            </Stack>
        </Box>
    );
}

const EVENT_TYPES: string[] = [
    "download:progress",
    "download:state-changed",
    "frontend:error",
    "game:state-changed",
    "installations:changed",
    "ipc:permission-request",
    "servers:updated",
    "timer:tick",
    "tts:install-output",
    "tts:status-changed",
    "tts:update-available",
];

const EVENT_TEMPLATES: Record<string, object> = {
    "tts:status-changed": { eventType: "tts:status-changed", timestamp: "", status: 0, message: "" },
    "tts:update-available": { eventType: "tts:update-available", timestamp: "", installedVersion: "1.0.0", latestVersion: "1.1.0" },
    "tts:install-output": { eventType: "tts:install-output", timestamp: "", line: "" },
    "servers:updated": { eventType: "servers:updated", timestamp: "" },
    "installations:changed": { eventType: "installations:changed", timestamp: "" },
    "game:state-changed": { eventType: "game:state-changed", timestamp: "" },
    "download:progress": { eventType: "download:progress", timestamp: "", downloadId: "", bytesDownloaded: 0, totalBytes: 0, speedBps: 0 },
    "download:state-changed": { eventType: "download:state-changed", timestamp: "", downloadId: "", state: 0 },
};

interface FiredEvent {
    id: number;
    eventType: string;
    timestamp: number;
}

let firedEventIdCounter = 0;

interface EventsTabProps {
    injectEvent: DevToolsChannelActions["injectEvent"];
    addMock: DevToolsChannelActions["addMock"];
}

function PresetRunner({ injectEvent, addMock }: { injectEvent: DevToolsChannelActions["injectEvent"]; addMock: DevToolsChannelActions["addMock"] }) {
    const [runningLabel, setRunningLabel] = useState<string | null>(null);
    const cancelRef = useRef(false);

    const runPreset = async (preset: EventPreset) => {
        cancelRef.current = false;
        setRunningLabel(preset.label);

        // Set up mocks before firing events (prevents backend refetch from overriding injected state)
        if (preset.mocks) {
            for (const mock of preset.mocks) {
                addMock(mock.endpoint, mock.response);
            }
        }

        for (const step of preset.events) {
            if (cancelRef.current) break;

            if (step.delayMs) {
                await new Promise<void>((resolve) => {
                    const timer = window.setTimeout(resolve, step.delayMs);
                    // Check cancel periodically isn't needed — just wait the delay
                    // If cancelled, we'll break on next iteration
                    void timer;
                });
                if (cancelRef.current) break;
            }

            // Refresh timestamp for each fired event
            const data = { ...step.data, timestamp: new Date().toISOString() };
            injectEvent(step.eventType, data);
        }

        setRunningLabel(null);
    };

    const handleCancel = () => {
        cancelRef.current = true;
        setRunningLabel(null);
    };

    return (
        <Sheet variant="outlined" sx={{ p: 1.5, borderRadius: "sm", mb: 2 }}>
            <Typography level="title-sm" sx={{ mb: 1 }}>TTS Presets</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {ttsPresets.map((preset) => (
                    <Button
                        key={preset.label}
                        size="sm"
                        variant="soft"
                        color={runningLabel === preset.label ? "warning" : "neutral"}
                        disabled={runningLabel !== null && runningLabel !== preset.label}
                        onClick={() => void runPreset(preset)}
                        title={preset.description}
                    >
                        {preset.label}
                    </Button>
                ))}
                {runningLabel !== null && (
                    <Button size="sm" variant="soft" color="danger" onClick={handleCancel}>
                        Cancel
                    </Button>
                )}
            </Stack>
            {runningLabel !== null && (
                <Typography level="body-xs" color="warning" sx={{ mt: 0.5 }}>
                    Running: {runningLabel}...
                </Typography>
            )}
        </Sheet>
    );
}

function EventsTab({ injectEvent, addMock }: EventsTabProps) {
    const [selectedType, setSelectedType] = useState<string>(EVENT_TYPES[0]);
    const [payload, setPayload] = useState(JSON.stringify(EVENT_TEMPLATES[EVENT_TYPES[0]] ?? { eventType: EVENT_TYPES[0], timestamp: "" }, null, 2));
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [firedEvents, setFiredEvents] = useState<FiredEvent[]>([]);

    const handleTypeChange = (newType: string) => {
        setSelectedType(newType);
        const template = EVENT_TEMPLATES[newType] ?? { eventType: newType, timestamp: "" };
        setPayload(JSON.stringify(template, null, 2));
        setJsonError(null);
    };

    const handleFire = () => {
        try {
            const parsed = JSON.parse(payload);
            setJsonError(null);
            // Fill in timestamp if empty
            if (parsed.timestamp === "") {
                parsed.timestamp = new Date().toISOString();
            }
            injectEvent(selectedType, parsed);
            setFiredEvents((prev) => [
                { id: ++firedEventIdCounter, eventType: selectedType, timestamp: Date.now() },
                ...prev.slice(0, 49),
            ]);
        } catch (e) {
            setJsonError(e instanceof Error ? e.message : "Invalid JSON");
        }
    };

    return (
        <Box>
            <PresetRunner injectEvent={injectEvent} addMock={addMock} />

            <Sheet variant="outlined" sx={{ p: 1.5, borderRadius: "sm", mb: 2 }}>
                <Typography level="title-sm" sx={{ mb: 1 }}>Inject Event</Typography>
                <Stack spacing={1}>
                    <FormControl size="sm">
                        <FormLabel>Event Type</FormLabel>
                        <Select
                            value={selectedType}
                            onChange={(_e, v) => { if (v) handleTypeChange(v); }}
                            sx={{ fontFamily: "monospace", fontSize: 13 }}
                        >
                            {EVENT_TYPES.map((t) => (
                                <Option key={t} value={t} sx={{ fontFamily: "monospace", fontSize: 13 }}>{t}</Option>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="sm" error={jsonError !== null}>
                        <FormLabel>Payload JSON</FormLabel>
                        <Textarea
                            minRows={4}
                            maxRows={12}
                            value={payload}
                            onChange={(e) => {
                                setPayload(e.target.value);
                                setJsonError(null);
                            }}
                            sx={{ fontFamily: "monospace", fontSize: 12 }}
                        />
                        {jsonError && (
                            <Typography level="body-xs" color="danger">{jsonError}</Typography>
                        )}
                    </FormControl>
                    <Button size="sm" onClick={handleFire}>
                        Fire Event
                    </Button>
                </Stack>
            </Sheet>

            <Typography level="title-sm" sx={{ mb: 1 }}>
                Event History ({firedEvents.length})
            </Typography>
            <Stack spacing={0.5}>
                {firedEvents.length === 0 && (
                    <Typography level="body-sm" color="neutral" sx={{ textAlign: "center", py: 4 }}>
                        No events fired yet.
                    </Typography>
                )}
                {firedEvents.map((evt) => (
                    <Sheet key={evt.id} variant="outlined" sx={{ p: 0.75, borderRadius: "sm" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography level="body-xs" fontFamily="monospace" sx={{ minWidth: 70 }}>
                                {new Date(evt.timestamp).toLocaleTimeString()}
                            </Typography>
                            <Chip size="sm" variant="soft" color="primary">
                                {evt.eventType}
                            </Chip>
                        </Stack>
                    </Sheet>
                ))}
            </Stack>
        </Box>
    );
}

interface StateTabProps {
    stateSnapshot: DevToolsChannelState["stateSnapshot"];
    requestStateSnapshot: DevToolsChannelActions["requestStateSnapshot"];
    isActive: boolean;
}

function StateTab({ stateSnapshot, requestStateSnapshot, isActive }: StateTabProps) {
    const hasRequestedRef = useRef(false);

    // Auto-request snapshot when tab becomes active for the first time
    useEffect(() => {
        if (isActive && !hasRequestedRef.current) {
            hasRequestedRef.current = true;
            requestStateSnapshot();
        }
    }, [isActive, requestStateSnapshot]);

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography level="title-sm">State Snapshot</Typography>
                <Button size="sm" variant="plain" onClick={requestStateSnapshot}>
                    Refresh
                </Button>
            </Stack>
            {stateSnapshot === null ? (
                <Typography level="body-sm" color="neutral" sx={{ textAlign: "center", py: 4 }}>
                    No snapshot yet — click Refresh or switch to this tab.
                </Typography>
            ) : (
                <Stack spacing={1}>
                    {Object.entries(stateSnapshot).map(([name, data]) => (
                        <Sheet key={name} variant="outlined" sx={{ borderRadius: "sm", overflow: "hidden" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1.5, py: 0.75, bgcolor: "background.level1" }}>
                                <Typography level="title-sm" fontFamily="monospace">{name}</Typography>
                                <Button
                                    size="sm"
                                    variant="plain"
                                    color="neutral"
                                    sx={{ minWidth: "auto", px: 0.5, fontSize: 11 }}
                                    onClick={() => void navigator.clipboard.writeText(JSON.stringify(data, null, 2))}
                                >
                                    Copy
                                </Button>
                            </Stack>
                            <Sheet variant="soft" sx={{ p: 1, overflow: "auto", maxHeight: 300 }}>
                                <pre style={{ margin: 0, fontSize: 11, whiteSpace: "pre-wrap" }}>
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </Sheet>
                        </Sheet>
                    ))}
                </Stack>
            )}
        </Box>
    );
}

const tabPanelSx = { flex: 1, overflow: "auto", p: 1.5 };
const hiddenSx = { ...tabPanelSx, display: "none" };

export default function DevToolsPage() {
    const channel = useDevToolsChannel();
    const [activeTab, setActiveTab] = useState("log");

    // Devtools always uses the default Pudu theme with a separate storage key to avoid
    // conflicting with the main window's CssVarsProvider
    return (
        <CssVarsProvider defaultMode="dark" modeStorageKey="pudu-devtools-mode" theme={themeRegistry.pudu}>
            <CssBaseline />
            <GlobalStyles styles={themeScrollbarRegistry.pudu} />
            <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v as string)} sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <TabList>
                        <Tab value="log">Log</Tab>
                        <Tab value="mocks">Mocks</Tab>
                        <Tab value="events">Events</Tab>
                        <Tab value="state">State</Tab>
                    </TabList>
                    {/* All panels always mounted, hidden via display:none to preserve state */}
                    <Box sx={activeTab === "log" ? tabPanelSx : hiddenSx}>
                        <LogTab requestLog={channel.requestLog} clearLog={channel.clearLog} />
                    </Box>
                    <Box sx={activeTab === "mocks" ? tabPanelSx : hiddenSx}>
                        <MocksTab
                            mocks={channel.mocks}
                            addMock={channel.addMock}
                            removeMock={channel.removeMock}
                            clearAllMocks={channel.clearAllMocks}
                        />
                    </Box>
                    <Box sx={activeTab === "events" ? tabPanelSx : hiddenSx}>
                        <EventsTab injectEvent={channel.injectEvent} addMock={channel.addMock} />
                    </Box>
                    <Box sx={activeTab === "state" ? tabPanelSx : hiddenSx}>
                        <StateTab
                            stateSnapshot={channel.stateSnapshot}
                            requestStateSnapshot={channel.requestStateSnapshot}
                            isActive={activeTab === "state"}
                        />
                    </Box>
                </Tabs>
            </Box>
        </CssVarsProvider>
    );
}
