import { Alert, CircularProgress, Stack, Typography } from "@mui/joy";
import InstallationCard from "../../molecules/installations/InstallationCard";
import { useInstallationsContext } from "../../../contextProviders/InstallationsContextProvider";

export default function InstallationCardList() {
    const { cards, isLoading, isEmpty } = useInstallationsContext();

    return (
        <Stack spacing={1.5} sx={{ px: 3, pb: 3, minHeight: 0, overflowY: "auto" }}>
            {isLoading && (
                <Alert color="neutral" variant="soft">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size="sm" />
                        <Typography level="body-sm">
                            Loading installations...
                        </Typography>
                    </Stack>
                </Alert>
            )}

            {isEmpty && (
                <Alert color="warning" variant="soft" invertedColors>
                    <Typography level="body-sm">
                        No installations found. Download a game version from the Servers page to get started.
                    </Typography>
                </Alert>
            )}

            {cards.map((card) => (
                <InstallationCard
                    key={card.id}
                    forkName={card.forkName}
                    buildVersion={card.buildVersion}
                    lastPlayedAt={card.lastPlayedAt}
                    isNewest={card.isNewest}
                    onDelete={card.onDelete}
                    onPlay={card.onPlay}
                />
            ))}
        </Stack>
    );
}
