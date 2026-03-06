import { Box, Button, Stack, Typography } from "@mui/joy";
import { keyframes } from "@emotion/react";
import VersionBadge from "../atoms/update/VersionBadge";
import ReleaseNotesCard from "../molecules/update/ReleaseNotesCard";
import DownloadProgress from "../molecules/update/DownloadProgress";

export type UpdateStatus = "update-available" | "downloading" | "installing" | "error";

interface UpdateLayoutProps {
    status: UpdateStatus;
    currentVersion: string;
    newVersion: string;
    downloadProgress: number;
    downloadTotal: number;
    releaseNotes: string | null;
    canAutoUpdate: boolean;
    onStartUpdate: () => void;
    onOpenReleasesPage: () => void;
}

const fadeSlideUp = keyframes`
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const gentlePulse = keyframes`
    0%, 100% { opacity: 0.7; }
    50%      { opacity: 1; }
`;

const shimmer = keyframes`
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const primaryButtonSx = {
    px: 3,
    fontWeight: 700,
    bgcolor: "primary.500",
    "&:hover": { bgcolor: "primary.600" },
} as const;

export default function UpdateLayout(props: UpdateLayoutProps) {
    const {
        status,
        currentVersion,
        newVersion,
        downloadProgress,
        downloadTotal,
        releaseNotes,
        canAutoUpdate,
        onStartUpdate,
        onOpenReleasesPage,
    } = props;

    const isDownloading = status === "downloading";
    const isInstalling = status === "installing";
    const isBusy = isDownloading || isInstalling;

    return (
        <Box sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            overflow: "hidden",
            bgcolor: "background.body",
            position: "relative",
        }}>
            <Box sx={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse 80% 60% at 30% 80%, rgba(var(--joy-palette-primary-mainChannel) / 0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(var(--joy-palette-primary-mainChannel) / 0.05) 0%, transparent 60%)",
                pointerEvents: "none",
            }} />

            <Box sx={{
                flex: "0 0 280px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                p: 4,
                animation: `${fadeSlideUp} 0.5s ease-out`,
            }}>
                <Box sx={{
                    position: "absolute",
                    width: 220,
                    height: 220,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(var(--joy-palette-primary-mainChannel) / 0.12) 0%, transparent 70%)",
                    filter: "blur(20px)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -55%)",
                }} />

                <Box
                    component="img"
                    src="/aiPlaceholders/pudu-maqui.png"
                    alt="Pudu mascot"
                    loading="lazy"
                    sx={{
                        width: 200,
                        height: "auto",
                        position: "relative",
                        filter: "drop-shadow(0 8px 24px rgba(0 0 0 / 0.3))",
                        mb: 3,
                    }}
                />
                <Box sx={{
                    position: "relative",
                    animation: `${fadeSlideUp} 0.5s ease-out 0.15s both`,
                }}>
                    <VersionBadge currentVersion={currentVersion} newVersion={newVersion} />
                </Box>
            </Box>

            <Stack
                sx={{
                    flex: 1,
                    minWidth: 0,
                    p: 4,
                    pl: 2,
                    justifyContent: "center",
                    animation: `${fadeSlideUp} 0.5s ease-out 0.1s both`,
                }}
                spacing={2.5}
            >
                <Stack spacing={0.5}>
                    <Typography
                        level="h3"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: "-0.01em",
                            background: "linear-gradient(135deg, var(--joy-palette-primary-300), var(--joy-palette-primary-500))",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        A fresh update is here
                    </Typography>
                    <Typography level="body-sm" sx={{ color: "text.secondary", maxWidth: 420 }}>
                        {canAutoUpdate
                            ? "A new version of PuduLauncher is ready. Update now to continue."
                            : "A new version is available. Please update through your package manager or the releases page."}
                    </Typography>
                </Stack>

                {releaseNotes && <ReleaseNotesCard content={releaseNotes} />}

                {isDownloading && (
                    <Box sx={{ animation: `${fadeSlideUp} 0.3s ease-out` }}>
                        <DownloadProgress progress={downloadProgress} total={downloadTotal} />
                    </Box>
                )}

                {isInstalling && (
                    <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 2,
                        py: 1.5,
                        borderRadius: "md",
                        bgcolor: "rgba(var(--joy-palette-primary-mainChannel) / 0.08)",
                        border: "1px solid rgba(var(--joy-palette-primary-mainChannel) / 0.15)",
                        animation: `${gentlePulse} 2s ease-in-out infinite`,
                    }}>
                        <Box sx={{
                            width: 40,
                            height: 4,
                            borderRadius: 2,
                            background: "linear-gradient(90deg, transparent, var(--joy-palette-primary-400), transparent)",
                            backgroundSize: "200% 100%",
                            animation: `${shimmer} 1.5s ease-in-out infinite`,
                        }} />
                        <Typography level="body-sm" sx={{ color: "primary.300", fontWeight: 600 }}>
                            Installing... the app will restart shortly
                        </Typography>
                    </Box>
                )}

                {status === "error" && (
                    <Box sx={{
                        px: 2,
                        py: 1.5,
                        borderRadius: "md",
                        bgcolor: "rgba(var(--joy-palette-danger-mainChannel) / 0.08)",
                        border: "1px solid rgba(var(--joy-palette-danger-mainChannel) / 0.15)",
                    }}>
                        <Typography level="body-sm" sx={{ color: "danger.300" }}>
                            Update failed. Please download the latest version manually.
                        </Typography>
                    </Box>
                )}

                {canAutoUpdate ? (
                    <Stack direction="row" spacing={1.5} sx={{ pt: 0.5 }}>
                        <Button
                            variant="plain"
                            color="neutral"
                            size="sm"
                            onClick={onOpenReleasesPage}
                            disabled={isBusy}
                            sx={{
                                fontWeight: 500,
                                color: "text.tertiary",
                                "&:hover": { color: "text.secondary", bgcolor: "transparent" },
                            }}
                        >
                            View releases
                        </Button>
                        <Button
                            size="sm"
                            onClick={onStartUpdate}
                            loading={isBusy}
                            disabled={isBusy}
                            sx={primaryButtonSx}
                        >
                            {isInstalling ? "Installing..." : "Update now"}
                        </Button>
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={1.5} sx={{ pt: 0.5 }}>
                        <Button
                            size="sm"
                            onClick={onOpenReleasesPage}
                            sx={primaryButtonSx}
                        >
                            Open releases page
                        </Button>
                    </Stack>
                )}
            </Stack>
        </Box>
    );
}
