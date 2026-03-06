import { LinearProgress, Stack, Typography } from "@mui/joy";

interface DownloadProgressProps {
    progress: number;
    total: number;
}

export default function DownloadProgress(props: DownloadProgressProps) {
    const { progress, total } = props;
    const percent = total > 0 ? (progress / total) * 100 : 0;

    return (
        <Stack spacing={1}>
            <LinearProgress
                determinate={total > 0}
                value={percent}
                sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "background.level2",
                    "--LinearProgress-progressColor": "var(--joy-palette-primary-400)",
                }}
            />
            <Typography level="body-xs" sx={{ color: "text.tertiary", fontFamily: "monospace" }}>
                {total > 0
                    ? `${Math.round(percent)}%  ${formatBytes(progress)} / ${formatBytes(total)}`
                    : "Downloading..."}
            </Typography>
        </Stack>
    );
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
