import { createContext, type PropsWithChildren, useContext, useMemo } from "react";
import {
    getServerId,
    resolveActionHandler,
    resolveActionState,
    resolveGameMode,
    resolveMapName,
    resolveProgress,
    resolveRoundTime,
    resolveServerName,
} from "./servers.resolvers";
import type { ServerCardProps } from "../components/organisms/servers/serverCard.types";

interface ServerCardViewModel extends ServerCardProps {
    id: string;
}

interface ServersContextValue {
    cards: ServerCardViewModel[];
    isLoading: boolean;
    isEmpty: boolean;
    lastUpdatedLabel: string;
}
import { useServerState } from "./useServerState";

const ServersContext = createContext<ServersContextValue | undefined>(undefined);

export function ServersContextProvider(props: PropsWithChildren) {
    const { children } = props;

    const {
        servers,
        sortedServers,
        installations,
        downloads,
        runningGames,
        lastUpdatedLabel,
        startDownload,
        launchGame,
    } = useServerState();

    const cards = useMemo<ServerCardViewModel[]>(() => {
        return sortedServers.map((server) => {
            const serverId = getServerId(server);
            const actionState = resolveActionState(server, downloads, installations, runningGames);

            return {
                id: serverId,
                name: resolveServerName(server),
                map: resolveMapName(server),
                build: String(server.buildVersion),
                mode: resolveGameMode(server),
                roundTime: resolveRoundTime(server),
                playersOnline: Math.max(0, server.playerCount),
                playerCapacity: Math.max(server.playerCount, server.playerCountMax),
                pingMs: Math.max(0, server.pingMs ?? 0),
                actionState,
                progress: resolveProgress(server, actionState, downloads),
                onActionClick: resolveActionHandler(
                    actionState,
                    () => startDownload(server),
                    () => launchGame(server),
                ),
            };
        });
    }, [downloads, installations, runningGames, sortedServers, startDownload, launchGame]);

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
