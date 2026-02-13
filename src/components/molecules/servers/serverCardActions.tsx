import type { ReactNode } from "react";
import {
    AutorenewRounded,
    DownloadRounded,
    ErrorOutlineRounded,
    PlayArrowRounded,
    ShieldRounded,
    SportsEsportsRounded,
    UnarchiveRounded,
} from "@mui/icons-material";
import type { ServerActionState } from "../../organisms/servers/serverCard.types";

export interface ServerActionVisual {
    color: "warning" | "primary" | "neutral" | "danger" | "success";
    icon: ReactNode;
    isDeterminate?: boolean;
}

const defaultActionLabelByState: Record<ServerActionState, string> = {
    download: "Download",
    downloading: "Downloading",
    extracting: "Extracting",
    scanning: "Scanning",
    downloadFailed: "Download Failed",
    scanningFailed: "Scanning Failed",
    join: "Join",
    playing: "Playing",
};

const actionVisualByState: Record<ServerActionState, ServerActionVisual> = {
    download: {
        color: "warning",
        icon: <DownloadRounded />,
    },
    downloading: {
        color: "primary",
        icon: <AutorenewRounded />,
    },
    extracting: {
        color: "primary",
        icon: <UnarchiveRounded />,
    },
    scanning: {
        color: "neutral",
        icon: <ShieldRounded />,
    },
    downloadFailed: {
        color: "danger",
        icon: <ErrorOutlineRounded />,
    },
    scanningFailed: {
        color: "danger",
        icon: <ShieldRounded />,
    },
    join: {
        color: "success",
        icon: <PlayArrowRounded />,
    },
    playing: {
        color: "success",
        icon: <SportsEsportsRounded />,
    },
};

export function inferActionState(actionLabel: string | undefined): ServerActionState {
    const normalizedLabel = actionLabel?.trim().toLowerCase() ?? "";

    if (normalizedLabel === "download") {
        return "download";
    }

    if (normalizedLabel === "downloading") {
        return "downloading";
    }

    if (normalizedLabel === "extracting") {
        return "extracting";
    }

    if (normalizedLabel === "scanning") {
        return "scanning";
    }

    if (normalizedLabel === "download failed") {
        return "downloadFailed";
    }

    if (normalizedLabel === "scanning failed") {
        return "scanningFailed";
    }

    return "join";
}

interface ResolveServerActionResult {
    resolvedActionState: ServerActionState;
    resolvedActionLabel: string;
    actionVisual: ServerActionVisual;
    isBusyAction: boolean;
    isDeterminate: boolean;
}

export function resolveServerAction(
    actionLabel: string | undefined,
    actionState: ServerActionState | undefined,
): ResolveServerActionResult {
    const resolvedActionState = actionState ?? inferActionState(actionLabel);
    const resolvedActionLabel = actionLabel ?? defaultActionLabelByState[resolvedActionState];
    const actionVisual = actionVisualByState[resolvedActionState];
    const isBusyAction = resolvedActionState === "downloading" || resolvedActionState === "extracting" || resolvedActionState === "scanning" || resolvedActionState === "playing";
    const isDeterminate = resolvedActionState === "downloading" || resolvedActionState === "downloadFailed" || resolvedActionState === "scanningFailed";

    return {
        resolvedActionState,
        resolvedActionLabel,
        actionVisual,
        isBusyAction,
        isDeterminate
    };
}
