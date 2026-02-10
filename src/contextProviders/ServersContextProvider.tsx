import {
    createContext,
    type PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import type { GameServer, ServerListUpdatedEvent } from "../pudu/generated";
import { EventListener } from "../pudu/events/event-listener";
import type {
    ServerActionState,
    ServerCardProgress,
    ServerCardProps,
} from "../components/organisms/servers/ServerCard";

type DownloadFlowState =
    | { state: "download" }
    | { state: "downloading"; progress: number }
    | { state: "scanning"; progress: number }
    | { state: "join" };

type DownloadFlowByServer = Record<string, DownloadFlowState>;

interface ServerCardViewModel extends ServerCardProps {
    id: string;
}

interface ServersContextValue {
    cards: ServerCardViewModel[];
    isLoading: boolean;
    isEmpty: boolean;
    lastUpdatedLabel: string;
}

const DOWNLOAD_INCREMENT = 4;
const SCAN_INCREMENT = 8;
const TICK_MS = 250;

const ServersContext = createContext<ServersContextValue | undefined>(undefined);

function getServerId(server: GameServer): string {
    const serverIp = server.serverIp?.trim();

    if (serverIp) {
        return `${serverIp}:${server.serverPort}`;
    }

    const serverName = server.serverName?.trim();

    if (serverName) {
        return `${serverName}:${server.serverPort}`;
    }

    return `unknown:${server.serverPort}`;
}

function resolveRoundTime(server: GameServer): string {
    const rawRoundTime = server.roundTime?.trim();

    if (!rawRoundTime || rawRoundTime.length === 0) {
        return "Unknown";
    }

    if (!/^\d+$/.test(rawRoundTime)) {
        return rawRoundTime;
    }

    const totalSeconds = Number.parseInt(rawRoundTime, 10);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
}

function resolveMapName(server: GameServer): string {
    const rawMap = server.currentMap?.trim();

    if (!rawMap) {
        return "Unknown map";
    }

    return rawMap
        .replace(/^MainStations\//, "")
        .replace(/\.json$/i, "");
}

function toCardActionState(flowState: DownloadFlowState): ServerActionState {
    if (flowState.state === "download") {
        return "download";
    }

    if (flowState.state === "downloading") {
        return "downloading";
    }

    if (flowState.state === "scanning") {
        return "scanning";
    }

    return "join";
}

function toCardProgress(flowState: DownloadFlowState, server: GameServer): ServerCardProgress | null {
    if (flowState.state === "downloading") {
        return {
            label: `Downloading build ${server.buildVersion}`,
            value: flowState.progress,
        };
    }

    if (flowState.state === "scanning") {
        return {
            label: "Scanning files",
            value: flowState.progress,
        };
    }

    return null;
}

function advanceDownloadFlow(flowByServer: DownloadFlowByServer): DownloadFlowByServer {
    let didUpdate = false;
    const next: DownloadFlowByServer = {};

    for (const [serverId, flowState] of Object.entries(flowByServer)) {
        if (flowState.state === "downloading") {
            const progress = Math.min(100, flowState.progress + DOWNLOAD_INCREMENT);

            if (progress >= 100) {
                next[serverId] = { state: "scanning", progress: 0 };
            } else {
                next[serverId] = { state: "downloading", progress };
            }

            didUpdate = true;
            continue;
        }

        if (flowState.state === "scanning") {
            const progress = Math.min(100, flowState.progress + SCAN_INCREMENT);

            if (progress >= 100) {
                next[serverId] = { state: "join" };
            } else {
                next[serverId] = { state: "scanning", progress };
            }

            didUpdate = true;
            continue;
        }

        next[serverId] = flowState;
    }

    return didUpdate ? next : flowByServer;
}

export function ServersContextProvider(props: PropsWithChildren) {
    const { children } = props;
    const [servers, setServers] = useState<GameServer[] | null>(null);
    const [downloadFlowByServer, setDownloadFlowByServer] = useState<DownloadFlowByServer>({});
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

    useEffect(() => {
        const eventListener = new EventListener();
        const handleServersUpdated = (event: ServerListUpdatedEvent) => {
            setServers(event.servers);
            setLastUpdatedAt(new Date(event.timestamp));
        };

        eventListener.on("servers:updated", handleServersUpdated);

        return () => {
            eventListener.off("servers:updated", handleServersUpdated);
            eventListener.disconnect();
        };
    }, []);

    useEffect(() => {
        if (servers === null) {
            return;
        }

        setDownloadFlowByServer((previousFlow) => {
            const nextFlow: DownloadFlowByServer = {};

            for (const server of servers) {
                const serverId = getServerId(server);
                nextFlow[serverId] = previousFlow[serverId] ?? { state: "download" };
            }

            return nextFlow;
        });
    }, [servers]);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setDownloadFlowByServer((previousFlow) => advanceDownloadFlow(previousFlow));
        }, TICK_MS);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const sortedServers = useMemo(() => {
        if (servers === null) {
            return [];
        }

        return [...servers].sort((left, right) => right.playerCount - left.playerCount);
    }, [servers]);

    const startFakeDownload = (serverId: string) => {
        setDownloadFlowByServer((previousFlow) => {
            const flowState = previousFlow[serverId];

            if (!flowState || flowState.state !== "download") {
                return previousFlow;
            }

            return {
                ...previousFlow,
                [serverId]: { state: "downloading", progress: 0 },
            };
        });
    };

    const cards = useMemo<ServerCardViewModel[]>(() => {
        return sortedServers.map((server) => {
            const serverId = getServerId(server);
            const flowState = downloadFlowByServer[serverId] ?? { state: "download" };

            return {
                id: serverId,
                name: server.serverName?.trim() || `${server.serverIp ?? "Unknown"}:${server.serverPort}`,
                map: resolveMapName(server),
                build: String(server.buildVersion),
                mode: server.gameMode?.trim() || "Unknown mode",
                roundTime: resolveRoundTime(server),
                playersOnline: Math.max(0, server.playerCount),
                playerCapacity: Math.max(server.playerCount, server.playerCountMax),
                pingMs: Math.max(0, server.pingMs ?? 0),
                actionState: toCardActionState(flowState),
                progress: toCardProgress(flowState, server),
                onActionClick: flowState.state === "download" ? () => startFakeDownload(serverId) : undefined,
            };
        });
    }, [downloadFlowByServer, sortedServers]);

    const lastUpdatedLabel = useMemo(() => {
        if (lastUpdatedAt === null) {
            return "Waiting for the first server list update...";
        }

        return `Last updated at ${lastUpdatedAt.toLocaleTimeString()}`;
    }, [lastUpdatedAt]);

    const value = useMemo<ServersContextValue>(() => ({
        cards,
        isLoading: servers === null,
        isEmpty: servers !== null && cards.length === 0,
        lastUpdatedLabel,
    }), [cards, lastUpdatedLabel, servers]);

    return (
        <ServersContext.Provider value={value}>
            {children}
        </ServersContext.Provider>
    );
}

export function useServersContext() {
    const context = useContext(ServersContext);

    if (context === undefined) {
        throw new Error("useServersContext must be used within a ServersContextProvider.");
    }

    return context;
}
