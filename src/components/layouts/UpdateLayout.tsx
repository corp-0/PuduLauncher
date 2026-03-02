import { Alert, Box, Button, LinearProgress, Stack, Typography } from "@mui/joy";

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

    const progressPercent = downloadTotal > 0 ? (downloadProgress / downloadTotal) * 100 : 0;
    const isDownloading = status === "downloading";
    const isInstalling = status === "installing";
    const isBusy = isDownloading || isInstalling;

    return (
        <Box sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.body",
        }}>
            <Stack spacing={3} sx={{ maxWidth: 540, width: "100%", p: 4 }}>
                <Stack spacing={0.5}>
                    <Typography level="h2">Update Available</Typography>
                    <Typography level="body-sm" color="neutral">
                        A new version of PuduLauncher is available. You need to update before continuing.
                    </Typography>
                </Stack>

                <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography level="body-sm" color="neutral">Current version</Typography>
                        <Typography level="body-sm">{currentVersion}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography level="body-sm" color="neutral">New version</Typography>
                        <Typography level="body-sm" fontWeight="lg">{newVersion}</Typography>
                    </Stack>
                </Stack>

                {releaseNotes && (
                    <Box sx={{
                        p: 1.5,
                        borderRadius: "sm",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.level1",
                        maxHeight: 200,
                        overflow: "auto",
                    }}>
                        <Typography level="title-sm" sx={{ mb: 1 }}>Release notes</Typography>
                        <Typography level="body-sm" sx={{ whiteSpace: "pre-wrap" }}>
                            {releaseNotes}
                        </Typography>
                    </Box>
                )}

                {isDownloading && (
                    <Stack spacing={1}>
                        <LinearProgress
                            determinate={downloadTotal > 0}
                            value={progressPercent}
                            sx={{ height: 8, borderRadius: "sm" }}
                        />
                        <Typography level="body-xs" color="neutral" textAlign="center">
                            {downloadTotal > 0
                                ? `${Math.round(progressPercent)}% — ${formatBytes(downloadProgress)} / ${formatBytes(downloadTotal)}`
                                : "Downloading..."}
                        </Typography>
                    </Stack>
                )}

                {isInstalling && (
                    <Alert color="primary" variant="soft">
                        Installing update... The application will restart automatically.
                    </Alert>
                )}

                {status === "error" && (
                    <Alert color="danger" variant="soft">
                        Update failed. Please download the latest version manually.
                    </Alert>
                )}

                {canAutoUpdate ? (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button variant="outlined" color="neutral" onClick={onOpenReleasesPage} disabled={isBusy}>
                            View Releases
                        </Button>
                        <Button onClick={onStartUpdate} loading={isBusy} disabled={isBusy}>
                            {isInstalling ? "Installing..." : "Update Now"}
                        </Button>
                    </Stack>
                ) : (
                    <Stack spacing={2}>
                        <Alert color="neutral" variant="soft">
                            Auto-update is not available on Linux. Please update through your package manager
                            or download the latest version from the releases page.
                        </Alert>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button onClick={onOpenReleasesPage}>
                                Open Releases Page
                            </Button>
                        </Stack>
                    </Stack>
                )}
            </Stack>
        </Box>
    );
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
