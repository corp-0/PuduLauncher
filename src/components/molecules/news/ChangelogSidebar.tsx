import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/joy";
import { ChangelogEntry } from "../../../pudu/generated";
import BuildEntry from "./BuildEntry";

interface ChangelogSidebarProps {
    entries: ChangelogEntry[];
    isLoading: boolean;
    isEmpty: boolean;
}

export default function ChangelogSidebar(props: ChangelogSidebarProps) {
    const { entries, isLoading, isEmpty } = props;

    return (
        <Box
            sx={{
                width: 380,
                minWidth: 380,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderLeft: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.surface",
            }}
        >
            <Box sx={{ p: 2, pb: 1.5 }}>
                <Typography level="title-md" sx={{ fontWeight: "lg" }}>
                    Changelog
                </Typography>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    px: 2,
                    pb: 2,
                }}
            >
                <Stack spacing={1}>
                    {isLoading && (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 2 }}>
                            <CircularProgress size="sm" />
                            <Typography level="body-xs">Loading...</Typography>
                        </Stack>
                    )}

                    {isEmpty && (
                        <Alert color="neutral" variant="soft" size="sm">
                            No changelog entries available.
                        </Alert>
                    )}

                    {entries.map((entry, i) => (
                        <BuildEntry key={`${entry.version}-${i}`} {...entry} />
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}
