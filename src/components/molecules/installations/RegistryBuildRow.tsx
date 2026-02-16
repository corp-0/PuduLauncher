import {Check, CloudDownload, Refresh} from "@mui/icons-material";
import {
    Button,
    Chip,
    LinearProgress,
    Sheet,
    Stack,
    Typography,
} from "@mui/joy";
import type {RegistryDownloadSnapshot} from "../../../contextProviders/InstallationsContextProvider";

const STATE_LABELS: Record<number, string> = {
    1: "Downloading",
    2: "Extracting",
    3: "Scanning",
    5: "Failed",
    6: "Scan failed",
};

interface RegistryBuildRowProps {
    versionNumber: string;
    dateCreated: string;
    download: RegistryDownloadSnapshot | undefined;
    isInstalled: boolean;
    onDownload: () => void;
}

export default function RegistryBuildRow(props: RegistryBuildRowProps) {
    const {versionNumber, dateCreated, download, isInstalled, onDownload} = props;

    const formattedDate = dateCreated
        ? new Date(dateCreated).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : null;

    const isDownloading = download?.state === 1;
    const isProcessing = download?.state === 2 || download?.state === 3;
    const isFailed = download?.state === 5 || download?.state === 6;
    const isBusy = isDownloading || isProcessing;

    return (
        <Sheet
            sx={{
                bgcolor: "background.level1",
                borderRadius: "md",
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
            }}
        >
            <Stack sx={{px: 2, py: 1.5}} spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack spacing={0.25}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography level="title-sm" sx={{fontFamily: "monospace"}}>
                                Build {versionNumber}
                            </Typography>
                            {isInstalled && !download && (
                                <Chip size="sm" variant="soft" color="success"
                                      startDecorator={<Check sx={{fontSize: 14}}/>}>
                                    Installed
                                </Chip>
                            )}
                        </Stack>
                        {formattedDate && (
                            <Typography level="body-xs" sx={{color: "text.tertiary"}}>
                                {formattedDate}
                            </Typography>
                        )}
                    </Stack>

                    {!download && !isInstalled && (
                        <Button
                            variant="soft"
                            color="primary"
                            size="sm"
                            startDecorator={<CloudDownload/>}
                            onClick={onDownload}
                        >
                            Download
                        </Button>
                    )}

                    {isBusy && (
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography level="body-sm">
                                {STATE_LABELS[download.state] ?? "Processing"}
                                {isDownloading && download.progress > 0 && ` ${Math.round(download.progress)}%`}
                            </Typography>
                        </Stack>
                    )}

                    {isFailed && (
                        <Button
                            variant="soft"
                            color="danger"
                            size="sm"
                            startDecorator={<Refresh/>}
                            onClick={onDownload}
                        >
                            Retry
                        </Button>
                    )}
                </Stack>
            </Stack>

            {isDownloading && (
                <LinearProgress
                    determinate
                    variant="soft"
                    value={download.progress}
                    color="primary"
                    sx={{borderRadius: 0}}
                />
            )}

            {isProcessing && (
                <LinearProgress
                    variant="soft"
                    color="success"
                    sx={{borderRadius: 0}}
                />
            )}
        </Sheet>
    );
}
