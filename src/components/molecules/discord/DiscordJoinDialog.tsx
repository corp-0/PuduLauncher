import {
    Box,
    Button,
    Chip,
    Divider,
    LinearProgress,
    Modal,
    ModalClose,
    ModalDialog,
    Sheet,
    Stack,
    Typography,
} from "@mui/joy";
import {
    Download,
    Dns,
    GamepadRounded,
    Map as MapIcon,
    People,
    SportsEsports,
} from "@mui/icons-material";
import type { ReactNode } from "react";

export interface DiscordJoinDialogProps {
    open: boolean;
    serverName?: string | null;
    forkName: string;
    buildVersion: number;
    gameMode?: string | null;
    currentMap?: string | null;
    playerCount: number;
    playerCountMax: number;
    accepting: boolean;
    onAccept: () => void;
    onDismiss: () => void;
}

function InfoRow(props: { icon: ReactNode; label: string; value: string }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ display: "flex", color: "text.tertiary", fontSize: 18 }}>
                {props.icon}
            </Box>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                {props.label}
            </Typography>
            <Typography level="body-sm" sx={{ color: "text.primary", ml: "auto !important" }}>
                {props.value}
            </Typography>
        </Stack>
    );
}

const discordBlurple = "#5865F2";

function DiscordIcon() {
    return (
        <svg width="28" height="28" viewBox="0 -28.5 256 256" fill="currentColor">
            <path d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.825 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.015-11.805-23.015-26.18s10.148-26.2 23.015-26.2c12.866 0 23.236 11.825 23.015 26.2.02 14.375-10.149 26.18-23.015 26.18Z" />
        </svg>
    );
}

export default function DiscordJoinDialog(props: DiscordJoinDialogProps) {
    const {
        open,
        serverName,
        forkName,
        buildVersion,
        gameMode,
        currentMap,
        playerCount,
        playerCountMax,
        accepting,
        onAccept,
        onDismiss,
    } = props;

    const hasPlayers = playerCountMax > 0;
    const fillPercent = hasPlayers ? (playerCount / playerCountMax) * 100 : 0;

    return (
        <Modal open={open} onClose={onDismiss}>
            <ModalDialog
                sx={{
                    maxWidth: 400,
                    p: 0,
                    overflow: "hidden",
                    gap: 0,
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                <ModalClose
                    sx={{
                        color: "common.white",
                        zIndex: 1,
                        "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                />

                {/* Discord-branded header */}
                <Box
                    sx={{
                        background: `linear-gradient(135deg, ${discordBlurple} 0%, #4752C4 100%)`,
                        px: 3,
                        py: 2.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                >
                    <DiscordIcon />
                    <Stack spacing={0.25}>
                        <Typography
                            level="title-lg"
                            sx={{ color: "common.white", fontWeight: 700 }}
                        >
                            Game Invite
                        </Typography>
                        <Typography level="body-sm" sx={{ color: "rgba(255,255,255,0.72)" }}>
                            A friend invited you to play
                        </Typography>
                    </Stack>
                </Box>

                {/* Body */}
                <Stack sx={{ p: 2.5 }} spacing={2}>
                    {/* Server name hero */}
                    {serverName && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Dns sx={{ color: "text.tertiary", fontSize: 20 }} />
                            <Typography level="title-md" sx={{ fontWeight: 600 }}>
                                {serverName}
                            </Typography>
                        </Stack>
                    )}

                    {/* Server details card */}
                    <Sheet
                        variant="outlined"
                        sx={{
                            borderRadius: "sm",
                            p: 1.5,
                        }}
                    >
                        <Stack spacing={1}>
                            <InfoRow
                                icon={<SportsEsports sx={{ fontSize: "inherit" }} />}
                                label="Fork"
                                value={forkName}
                            />
                            <InfoRow
                                icon={<Download sx={{ fontSize: "inherit" }} />}
                                label="Build"
                                value={`v${buildVersion}`}
                            />
                            {currentMap && (
                                <InfoRow
                                    icon={<MapIcon sx={{ fontSize: "inherit" }} />}
                                    label="Map"
                                    value={currentMap}
                                />
                            )}
                            {gameMode && (
                                <InfoRow
                                    icon={<GamepadRounded sx={{ fontSize: "inherit" }} />}
                                    label="Mode"
                                    value={gameMode}
                                />
                            )}

                            {hasPlayers && (
                                <>
                                    <Divider />
                                    <Stack spacing={0.5}>
                                        <Stack direction="row" alignItems="center" spacing={0.75}>
                                            <People sx={{ fontSize: 18, color: "text.tertiary" }} />
                                            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
                                                Players
                                            </Typography>
                                            <Chip
                                                size="sm"
                                                variant="soft"
                                                color={fillPercent >= 90 ? "warning" : "neutral"}
                                                sx={{ ml: "auto !important" }}
                                            >
                                                {playerCount} / {playerCountMax}
                                            </Chip>
                                        </Stack>
                                        <LinearProgress
                                            determinate
                                            value={fillPercent}
                                            color={fillPercent >= 90 ? "warning" : "primary"}
                                            sx={{
                                                "--LinearProgress-thickness": "6px",
                                                "--LinearProgress-radius": "3px",
                                            }}
                                        />
                                    </Stack>
                                </>
                            )}
                        </Stack>
                    </Sheet>

                    {/* Install notice */}
                    <Typography
                        level="body-sm"
                        sx={{ color: "text.secondary", textAlign: "center" }}
                    >
                        This build is not installed yet. Install it to join the server.
                    </Typography>

                    {/* Actions */}
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            color="neutral"
                            onClick={onDismiss}
                            sx={{ flex: 1 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            loading={accepting}
                            onClick={onAccept}
                            startDecorator={!accepting && <Download />}
                            sx={{ flex: 1 }}
                        >
                            Install & Join
                        </Button>
                    </Stack>
                </Stack>
            </ModalDialog>
        </Modal>
    );
}
