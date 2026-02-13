import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/joy";
import ServerCard from "../organisms/servers/ServerCard";
import { useServersContext } from "../../contextProviders/ServersContextProvider";

export default function ServersLayout() {
    const { cards, isLoading, isEmpty, lastUpdatedLabel } = useServersContext();

    return (
        <Box sx={{ height: "100%", minWidth: 0, display: "flex", flexDirection: "column" }}>
            <Stack spacing={0.5} sx={{ p: 3, pb: 2 }}>
                <Typography level="h1">
                    Servers
                </Typography>
                <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                    {lastUpdatedLabel}
                </Typography>
            </Stack>

            <Stack spacing={1.5} sx={{ px: 3, pb: 3, minHeight: 0, overflowY: "auto" }}>
                {isLoading && (
                    <Alert color="neutral" variant="soft">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <CircularProgress size="sm" />
                            <Typography level="body-sm">
                                Refreshing server list...
                            </Typography>
                        </Stack>
                    </Alert>
                )}

                {isEmpty && (
                    <Alert color="warning" variant="soft">
                        <Typography level="body-sm">
                            No servers are currently available.
                        </Typography>
                    </Alert>
                )}

                {cards.map((card) => (
                    <ServerCard
                        key={card.id}
                        {...card}
                    />
                ))}
            </Stack>
        </Box>
    );
}
