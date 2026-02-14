import { CloudDownload } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/joy";
import InstallationCardList from "../organisms/installations/InstallationCardList";
import InstallationRegistryPopup from "../organisms/installations/InstallationRegistryPopup";
import { useInstallationsContext } from "../../contextProviders/InstallationsContextProvider";

export default function InstallationsLayout() {
    const { openRegistry } = useInstallationsContext();

    return (
        <Box sx={{ height: "100%", minWidth: 0, display: "flex", flexDirection: "column" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ p: 3, pb: 2 }}>
                <Stack spacing={0.5}>
                    <Typography level="h1">
                        Installations
                    </Typography>
                    <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                        Manage your local game installations
                    </Typography>
                </Stack>
                <Button
                    variant="soft"
                    color="primary"
                    startDecorator={<CloudDownload />}
                    onClick={openRegistry}
                >
                    Browse Builds
                </Button>
            </Stack>

            <InstallationCardList />
            <InstallationRegistryPopup />
        </Box>
    );
}
