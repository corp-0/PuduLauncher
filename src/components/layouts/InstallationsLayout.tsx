import { CloudDownload, Folder } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/joy";
import InstallationCardList from "../organisms/installations/InstallationCardList";
import InstallationRegistryPopup from "../organisms/installations/InstallationRegistryPopup";
import { useInstallationsContext } from "../../contextProviders/InstallationsContextProvider";

export default function InstallationsLayout() {
    const { openRegistry, openInstallationsFolder } = useInstallationsContext();

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

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startDecorator={<Folder />}
                        onClick={openInstallationsFolder}
                    >
                        Installations Folder
                    </Button>
                    <Button
                        variant="soft"
                        color="primary"
                        startDecorator={<CloudDownload />}
                        onClick={openRegistry}
                    >
                        Download Builds
                    </Button>
                </Stack>

            </Stack>

            <InstallationCardList />
            <InstallationRegistryPopup />
        </Box>
    );
}
