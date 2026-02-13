import type { GameServer, Installation } from "../pudu/generated";
import type { ServerActionState, ServerCardProgress } from "../components/organisms/servers/serverCard.types";
import { DownloadState, type DownloadSnapshot } from "./useServerState";

export function getServerId(server: GameServer): string {
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

export function downloadKey(forkName: string, buildVersion: number): string {
    return `${forkName}:${buildVersion}`;
}

export function resolveRoundTime(server: GameServer): string {
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

export function resolveMapName(server: GameServer): string {
    const rawMap = server.currentMap?.trim();

    if (!rawMap) {
        return "Unknown map";
    }

    return rawMap
        .replace(/^MainStations\//, "")
        .replace(/\.json$/i, "");
}

function downloadStateToActionState(state: number): ServerActionState {
    switch (state) {
        case DownloadState.InProgress:
            return "downloading";
        case DownloadState.Extracting:
            return "extracting";
        case DownloadState.Scanning:
            return "scanning";
        case DownloadState.Failed:
            return "downloadFailed";
        case DownloadState.ScanFailed:
            return "scanningFailed";
        default:
            return "download";
    }
}

export function resolveActionState(
    server: GameServer,
    downloads: Map<string, DownloadSnapshot>,
    installations: Installation[],
    runningGames: Set<string>,
): ServerActionState {
    const key = downloadKey(server.forkName ?? "", server.buildVersion);
    const snapshot = downloads.get(key);

    if (snapshot) {
        const actionState = downloadStateToActionState(snapshot.state);
        if (actionState !== "download") {
            return actionState;
        }
    }

    const serverKey = `${server.serverIp?.trim() ?? ""}:${server.serverPort}`;
    if (runningGames.has(serverKey)) {
        return "playing";
    }

    const hasInstallation = installations.some(
        (i) => i.forkName === server.forkName && i.buildVersion === server.buildVersion,
    );

    if (hasInstallation) {
        return "join";
    }

    return "download";
}

export function resolveServerName(server: GameServer): string {
    return server.serverName?.trim() || `${server.serverIp ?? "Unknown"}:${server.serverPort}`;
}

export function resolveGameMode(server: GameServer): string {
    return server.gameMode?.trim() || "Unknown mode";
}

export function resolveActionHandler(
    actionState: ServerActionState,
    onDownload: () => void,
    onJoin: () => void,
): (() => void) | undefined {
    if (actionState === "download" || actionState === "downloadFailed" || actionState === "scanningFailed") {
        return onDownload;
    }

    if (actionState === "join") {
        return onJoin;
    }

    return undefined;
}

export function resolveProgress(
    server: GameServer,
    actionState: ServerActionState,
    downloads: Map<string, DownloadSnapshot>,
): ServerCardProgress | null {
    const key = downloadKey(server.forkName ?? "", server.buildVersion);
    const snapshot = downloads.get(key);

    switch (actionState) {
        case "downloading":
            return {
                label: `Downloading build ${server.buildVersion}`,
                value: snapshot?.progress ?? 0,
            };
        case "extracting":
            return {
                label: `Extracting build ${server.buildVersion}`,
                value: 100,
            };
        case "scanning":
            return {
                label: "Scanning files",
                value: 100,
            };
        case "downloadFailed":
            return {
                label: snapshot?.errorMessage ?? "Download failed",
                value: 100,
            };
        case "scanningFailed":
            return {
                label: snapshot?.errorMessage ?? "Scan failed",
                value: 100,
            };
        default:
            return null;
    }
}
