import { useCallback, useEffect, useMemo, useState } from "react";
import type {
    DownloadProgressEvent,
    DownloadStateChangedEvent,
    GameServer,
    GameStateChangedEvent,
    Installation,
    InstallationsChangedEvent,
} from "../pudu/generated";
import { DownloadsApi, GameLaunchApi, InstallationsApi, PreferencesApi, ServersApi } from "../pudu/generated";
import { EventListener } from "../pudu/events/event-listener";
import { downloadKey } from "./servers.resolvers";
import { useErrorContext } from "./ErrorContextProvider";

// Mirrors C# DownloadState enum
export const DownloadState = {
    NotDownloaded: 0,
    InProgress: 1,
    Extracting: 2,
    Scanning: 3,
    Installed: 4,
    Failed: 5,
    ScanFailed: 6,
} as const;

export interface DownloadSnapshot {
    forkName: string;
    buildVersion: number;
    state: number;
    progress: number;
    errorMessage?: string | null;
}

interface UseServerStateOptions {
    isServersPageActive: boolean;
}

const DEFAULT_SERVER_POLL_INTERVAL_MS = 10_000;

export function useServerState(options: UseServerStateOptions) {
    const { isServersPageActive } = options;
    const { showError } = useErrorContext();
    const [servers, setServers] = useState<GameServer[] | null>(null);
    const [installations, setInstallations] = useState<Installation[]>([]);
    const [downloads, setDownloads] = useState<Map<string, DownloadSnapshot>>(new Map());
    const [runningGames, setRunningGames] = useState<Set<string>>(new Set());
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

    // Fetch initial state on mount
    useEffect(() => {
        const installationsApi = new InstallationsApi();
        const downloadsApi = new DownloadsApi();

        installationsApi.getInstallations().then((result) => {
            if (result.success && result.data) {
                setInstallations(result.data);
                return;
            }

            showError({
                source: "frontend.installations.get-installations",
                userMessage: "Failed to load local installations.",
                code: "INSTALLATIONS_FETCH_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
            });
        }).catch((error: unknown) => {
            const technicalDetails = error instanceof Error ? error.toString() : String(error);
            showError({
                source: "frontend.installations.get-installations",
                userMessage: "Failed to load local installations.",
                code: "INSTALLATIONS_FETCH_EXCEPTION",
                technicalDetails,
            });
        });

        downloadsApi.getActiveDownloads().then((result) => {
            if (result.success && result.data) {
                const map = new Map<string, DownloadSnapshot>();
                for (const dl of result.data) {
                    map.set(downloadKey(dl.forkName, dl.buildVersion), {
                        forkName: dl.forkName,
                        buildVersion: dl.buildVersion,
                        state: dl.state,
                        progress: dl.progress,
                        errorMessage: dl.errorMessage,
                    });
                }
                setDownloads(map);
                return;
            }

            showError({
                source: "frontend.downloads.get-active-downloads",
                userMessage: "Failed to load active downloads.",
                code: "DOWNLOADS_FETCH_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
            });
        }).catch((error: unknown) => {
            const technicalDetails = error instanceof Error ? error.toString() : String(error);
            showError({
                source: "frontend.downloads.get-active-downloads",
                userMessage: "Failed to load active downloads.",
                code: "DOWNLOADS_FETCH_EXCEPTION",
                technicalDetails,
            });
        });
    }, [showError]);

    useEffect(() => {
        if (!isServersPageActive) {
            return;
        }

        let isDisposed = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let pollIntervalMs = DEFAULT_SERVER_POLL_INTERVAL_MS;
        const serversApi = new ServersApi();
        const preferencesApi = new PreferencesApi();

        const fetchServers = async () => {
            const result = await serversApi.getServers();
            if (isDisposed) {
                return;
            }

            if (!result.success) {
                setServers((prev) => prev ?? []);
                showError({
                    source: "frontend.servers.get-servers",
                    userMessage: "Failed to refresh server list.",
                    code: "SERVERS_FETCH_FAILED",
                    technicalDetails: result.error ?? "Unknown backend error.",
                    dedupe: false,
                });
                return;
            }

            setServers(result.data ?? []);
            setLastUpdatedAt(new Date());
        };

        const fetchPollInterval = async () => {
            const result = await preferencesApi.getPreferences();
            if (isDisposed || !result.success || !result.data) {
                if (!isDisposed && !result.success) {
                    showError({
                        source: "frontend.preferences.get-preferences",
                        userMessage: "Failed to refresh preferences.",
                        code: "PREFERENCES_FETCH_FAILED",
                        technicalDetails: result.error ?? "Unknown backend error.",
                    });
                }
                return;
            }

            const intervalSeconds = result.data.servers.serverListFetchIntervalSeconds;
            if (!Number.isFinite(intervalSeconds)) {
                return;
            }

            pollIntervalMs = Math.max(1, Math.floor(intervalSeconds)) * 1000;
        };

        const poll = async () => {
            await fetchServers();
            if (isDisposed) {
                return;
            }

            timeoutId = setTimeout(() => {
                void poll();
            }, pollIntervalMs);
        };

        void (async () => {
            await fetchPollInterval();
            await poll();
        })();

        return () => {
            isDisposed = true;
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
        };
    }, [isServersPageActive, showError]);

    // Subscribe to real-time events
    useEffect(() => {
        const eventListener = new EventListener();

        eventListener.on("installations:changed", (event: InstallationsChangedEvent) => {
            setInstallations(event.installations);
        });

        eventListener.on("download:progress", (event: DownloadProgressEvent) => {
            const key = downloadKey(event.forkName, event.buildVersion);
            setDownloads((prev) => {
                const next = new Map(prev);
                const existing = next.get(key);
                next.set(key, {
                    forkName: event.forkName,
                    buildVersion: event.buildVersion,
                    state: existing?.state ?? DownloadState.InProgress,
                    progress: event.progress,
                    errorMessage: existing?.errorMessage,
                });
                return next;
            });
        });

        eventListener.on("download:state-changed", (event: DownloadStateChangedEvent) => {
            const key = downloadKey(event.forkName, event.buildVersion);
            setDownloads((prev) => {
                const next = new Map(prev);
                if (event.state === DownloadState.Installed) {
                    next.delete(key);
                } else {
                    const existing = next.get(key);
                    next.set(key, {
                        forkName: event.forkName,
                        buildVersion: event.buildVersion,
                        state: event.state,
                        progress: existing?.progress ?? 0,
                        errorMessage: event.errorMessage,
                    });
                }
                return next;
            });
        });

        eventListener.on("game:state-changed", (event: GameStateChangedEvent) => {
            const key = `${event.serverIp}:${event.serverPort}`;
            setRunningGames((prev) => {
                const next = new Set(prev);
                if (event.isRunning) {
                    next.add(key);
                } else {
                    next.delete(key);
                }
                return next;
            });
        });

        return () => {
            eventListener.disconnect();
        };
    }, []);

    const sortedServers = useMemo(() => {
        if (servers === null) {
            return [];
        }

        return [...servers].sort((left, right) => right.playerCount - left.playerCount);
    }, [servers]);

    const startDownload = useCallback((server: GameServer) => {
        const forkName = server.forkName ?? "";
        const buildVersion = server.buildVersion;
        const key = downloadKey(forkName, buildVersion);

        setDownloads((prev) => {
            const next = new Map(prev);
            next.set(key, {
                forkName,
                buildVersion,
                state: DownloadState.InProgress,
                progress: 0,
                errorMessage: null,
            });
            return next;
        });

        const api = new DownloadsApi();
        void api.startDownload(server).then((result) => {
            if (result.success) {
                return;
            }

            const errorMessage = result.error ?? "Failed to start download.";

            setDownloads((prev) => {
                const next = new Map(prev);
                const existing = next.get(key);
                if (!existing) {
                    return next;
                }

                next.set(key, {
                    ...existing,
                    state: DownloadState.Failed,
                    errorMessage,
                });
                return next;
            });

            showError({
                source: "frontend.downloads.start-download",
                userMessage: "Failed to start download.",
                code: "DOWNLOAD_START_FAILED",
                technicalDetails: errorMessage,
                dedupe: false,
            });
        }).catch((error: unknown) => {
            const errorMessage = error instanceof Error
                ? error.message
                : "Failed to start download.";

            setDownloads((prev) => {
                const next = new Map(prev);
                const existing = next.get(key);
                if (!existing) {
                    return next;
                }

                next.set(key, {
                    ...existing,
                    state: DownloadState.Failed,
                    errorMessage,
                });
                return next;
            });

            showError({
                source: "frontend.downloads.start-download",
                userMessage: "Failed to start download.",
                code: "DOWNLOAD_START_EXCEPTION",
                technicalDetails: error instanceof Error ? error.toString() : String(error),
                dedupe: false,
            });
        });
    }, [showError]);

    const launchGame = useCallback((server: GameServer) => {
        const installation = installations.find(
            (i) => i.forkName === server.forkName && i.buildVersion === server.buildVersion,
        );

        if (!installation) return;

        const api = new GameLaunchApi();
        void api.launchGame({
            installationId: installation.id,
            serverIp: server.serverIp,
            serverPort: server.serverPort,
        }).then((result) => {
            if (result.success) {
                return;
            }

            showError({
                source: "frontend.game-launch.launch-game",
                userMessage: "Failed to launch game.",
                code: "GAME_LAUNCH_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
                dedupe: false,
            });
        }).catch((error: unknown) => {
            showError({
                source: "frontend.game-launch.launch-game",
                userMessage: "Failed to launch game.",
                code: "GAME_LAUNCH_EXCEPTION",
                technicalDetails: error instanceof Error ? error.toString() : String(error),
                dedupe: false,
            });
        });
    }, [installations, showError]);

    const lastUpdatedLabel = useMemo(() => {
        if (lastUpdatedAt === null) {
            return "Waiting for the first server list refresh...";
        }

        return `Last updated at ${lastUpdatedAt.toLocaleTimeString()}`;
    }, [lastUpdatedAt]);

    return {
        servers,
        sortedServers,
        installations,
        downloads,
        runningGames,
        lastUpdatedLabel,
        startDownload,
        launchGame,
    };
}
