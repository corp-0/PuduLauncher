import type { ReactNode } from "react";
import {
    AutorenewRounded,
    DownloadRounded,
    PlayArrowRounded,
    ShieldRounded,
} from "@mui/icons-material";
import type { ServerActionState } from "../../organisms/servers/serverCard.types";

export interface ServerActionVisual {
    color: "warning" | "primary" | "neutral" | "danger" | "success";
    icon: ReactNode;
}

const defaultActionLabelByState: Record<ServerActionState, string> = {
    download: "Download",
    downloading: "Downloading",
    scanning: "Scanning",
    scanningFailed: "Scanning Failed",
    join: "Join",
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
    scanning: {
        color: "neutral",
        icon: <ShieldRounded />,
    },
    scanningFailed: {
        color: "danger",
        icon: <ShieldRounded />,
    },
    join: {
        color: "success",
        icon: <PlayArrowRounded />,
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

    if (normalizedLabel === "scanning") {
        return "scanning";
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
}

export function resolveServerAction(
    actionLabel: string | undefined,
    actionState: ServerActionState | undefined,
): ResolveServerActionResult {
    const resolvedActionState = actionState ?? inferActionState(actionLabel);
    const resolvedActionLabel = actionLabel ?? defaultActionLabelByState[resolvedActionState];
    const actionVisual = actionVisualByState[resolvedActionState];
    const isBusyAction = resolvedActionState === "downloading" || resolvedActionState === "scanning";

    return {
        resolvedActionState,
        resolvedActionLabel,
        actionVisual,
        isBusyAction,
    };
}
