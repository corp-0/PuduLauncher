import RegistryBuildsPopup from "../../molecules/installations/RegistryBuildsPopup";
import { useInstallationsContext } from "../../../contextProviders/InstallationsContextProvider";

export default function InstallationRegistryPopup() {
    const {
        registryBuilds,
        registryLoading,
        registryOpen,
        registryDownloads,
        installedBuildVersions,
        downloadBuild,
        closeRegistry,
    } = useInstallationsContext();

    return (
        <RegistryBuildsPopup
            open={registryOpen}
            builds={registryBuilds}
            loading={registryLoading}
            downloads={registryDownloads}
            installedVersions={installedBuildVersions}
            onDownload={downloadBuild}
            onClose={closeRegistry}
        />
    );
}
