export interface ServerCardProgress {
    label: string;
    value: number;
}

export type ServerActionState = "download" | "downloading" | "extracting" | "scanning" | "downloadFailed" | "scanningFailed" | "join" | "playing";

export interface ServerCardProps {
    name: string;
    map: string;
    build: string;
    mode: string;
    roundTime: string;
    playersOnline: number;
    playerCapacity: number;
    pingMs: number;
    iconSrc?: string;
    actionLabel?: string;
    actionState?: ServerActionState;
    onActionClick?: () => void;
    isActionDisabled?: boolean;
    progress?: ServerCardProgress | null;
}
