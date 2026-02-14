import { Delete, Folder, PlayArrow } from "@mui/icons-material";
import { Button, Chip, Sheet, Stack, Typography } from "@mui/joy";

type LastPlayedValue = string | Date | null;
type LastPlayedLabel = "Recently Played" | "A while ago";

const RECENTLY_PLAYED_THRESHOLD_DAYS = 14;

interface InstallationCardProps {
    forkName: string;
    buildVersion: string;
    lastPlayedAt?: LastPlayedValue;
    isNewest?: boolean;
    onDelete?: () => void;
    onPlay?: () => void;
}

export default function InstallationCard(props: InstallationCardProps) {
    const { forkName, buildVersion, lastPlayedAt, isNewest = false, onDelete, onPlay } = props;

    const getLastPlayedLabel = (value: Exclude<LastPlayedValue, null>): LastPlayedLabel | null => {
        const parsedDate = value instanceof Date ? value : new Date(value);

        if (Number.isNaN(parsedDate.getTime()) || parsedDate.getFullYear() <= 1) {
            return null;
        }

        const daysSincePlayed = (Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSincePlayed <= RECENTLY_PLAYED_THRESHOLD_DAYS ? "Recently Played" : "A while ago";
    };

    const lastPlayedLabel = lastPlayedAt ? getLastPlayedLabel(lastPlayedAt) : null;

    return (
        <Sheet
            sx={{
                bgcolor: "background.level1",
                borderRadius: "lg",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "sm",
                overflow: "hidden",
                padding: 2,
            }}>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}>
                <Stack
                    alignItems="flex-start"
                    spacing={1.5}
                    direction="row"
                    sx={{ minWidth: 0, flex: 1 }}>
                    <Sheet
                        variant="soft"
                        color="neutral"
                        sx={{
                            borderRadius: "md",
                            width: 36,
                            height: 36,
                            display: "grid",
                            placeItems: "center",
                        }}>
                        <Folder />
                    </Sheet>
                    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            useFlexGap
                            flexWrap="wrap">
                            <Typography
                                level="title-md"
                                sx={{ overflowWrap: "anywhere" }}>
                                {forkName}
                            </Typography>
                            {isNewest && (
                                <Chip size="sm" variant="soft" color="success">
                                    Newest
                                </Chip>
                            )}
                            {lastPlayedLabel && (
                                <Chip size="sm" variant="soft" color="primary">
                                    {lastPlayedLabel}
                                </Chip>
                            )}
                        </Stack>
                        <Typography level="body-sm" sx={{ fontFamily: "monospace" }}>
                            Build {buildVersion}
                        </Typography>
                    </Stack>
                </Stack>

                <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{ ml: { sm: "auto" } }}>
                    <Button
                        variant="outlined"
                        color="danger"
                        size="sm"
                        startDecorator={<Delete />}
                        onClick={onDelete}>
                        Delete
                    </Button>
                    <Button
                        variant="solid"
                        color="success"
                        size="sm"
                        startDecorator={<PlayArrow />}
                        onClick={onPlay}>
                        Play
                    </Button>
                </Stack>
            </Stack>
        </Sheet>
    )
}
