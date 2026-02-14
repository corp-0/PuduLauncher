import { Close } from "@mui/icons-material";
import {
    Alert,
    Box,
    CircularProgress,
    IconButton,
    Modal,
    ModalDialog,
    Stack,
    Typography,
} from "@mui/joy";
import type { RegistryBuild } from "../../../pudu/generated";
import type { RegistryDownloadSnapshot } from "../../../contextProviders/InstallationsContextProvider";
import { usePaginatedCollection } from "../../../hooks/usePaginatedCollection";
import RegistryBuildRow from "./RegistryBuildRow";
import PaginationControls from "../PaginationControls";

const PAGE_SIZE = 25;

interface RegistryBuildsPopupProps {
    open: boolean;
    builds: RegistryBuild[];
    loading: boolean;
    downloads: Map<number, RegistryDownloadSnapshot>;
    installedVersions: Set<number>;
    onDownload: (buildVersion: number) => void;
    onClose: () => void;
}

export default function RegistryBuildsPopup(props: RegistryBuildsPopupProps) {
    const { open, builds, loading, downloads, installedVersions, onDownload, onClose } = props;

    const {
        currentPageItems,
        currentPage,
        totalPages,
        nextPage,
        previousPage,
        totalItems,
    } = usePaginatedCollection(builds, PAGE_SIZE);

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog layout="fullscreen" sx={{ p: 3 }}>
                <Stack spacing={2} sx={{ height: "100%" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack spacing={0.5}>
                            <Typography level="h2">Registry Builds</Typography>
                            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                                {totalItems} builds available from Unitystation registry
                            </Typography>
                        </Stack>
                        <IconButton variant="plain" onClick={onClose}>
                            <Close />
                        </IconButton>
                    </Stack>

                    {loading && (
                        <Alert color="neutral" variant="soft">
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CircularProgress size="sm" />
                                <Typography level="body-sm">
                                    Fetching builds from registry...
                                </Typography>
                            </Stack>
                        </Alert>
                    )}

                    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                        <Stack spacing={1}>
                            {currentPageItems.map((build) => {
                                const buildVersion = parseInt(build.versionNumber, 10);
                                return (
                                    <RegistryBuildRow
                                        key={build.versionNumber}
                                        versionNumber={build.versionNumber}
                                        dateCreated={build.dateCreated}
                                        download={downloads.get(buildVersion)}
                                        isInstalled={installedVersions.has(buildVersion)}
                                        onDownload={() => onDownload(buildVersion)}
                                    />
                                );
                            })}
                        </Stack>
                    </Box>

                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPrevious={previousPage}
                        onNext={nextPage}
                    />
                </Stack>
            </ModalDialog>
        </Modal>
    );
}
