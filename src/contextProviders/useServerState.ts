import { useCallback, useEffect, useMemo, useState } from "react";
import type {
    DownloadProgressEvent,
    DownloadStateChangedEvent,
    GameServer,
    GameStateChangedEvent,
    Installation,
    InstallationsChangedEvent,
    ServerListUpdatedEvent,
} from "../pudu/generated";
import { DownloadsApi, GameLaunchApi, InstallationsApi } from "../pudu/generated";
import { EventListener } from "../pudu/events/event-listener";
import { downloadKey } from "./servers.resolvers";

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

export function useServerState() {
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
            }
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
            }
        });
    }, []);

    // Subscribe to all events
    useEffect(() => {
        const eventListener = new EventListener();

        eventListener.on("servers:updated", (event: ServerListUpdatedEvent) => {
            setServers(event.servers);
            setLastUpdatedAt(new Date(event.timestamp));
        });

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
        const key = downloadKey(server.forkName ?? "", server.buildVersion);
        setDownloads((prev) => {
            const next = new Map(prev);
            next.delete(key);
            return next;
        });

        const api = new DownloadsApi();
        api.startDownload(server);
    }, []);

    const launchGame = useCallback((server: GameServer) => {
        const installation = installations.find(
            (i) => i.forkName === server.forkName && i.buildVersion === server.buildVersion,
        );

        if (!installation) return;

        const api = new GameLaunchApi();
        api.launchGame({
            installationId: installation.id,
            serverIp: server.serverIp,
            serverPort: server.serverPort,
        });
    }, [installations]);

    const lastUpdatedLabel = useMemo(() => {
        if (lastUpdatedAt === null) {
            return "Waiting for the first server list update...";
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
