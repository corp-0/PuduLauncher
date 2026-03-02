import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { getVersion } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import { openUrl } from "@tauri-apps/plugin-opener";
import { FeedbackContext } from "./FeedbackContextProvider";
import UpdateLayout from "../components/layouts/UpdateLayout";

type UpdateStatus = "checking" | "no-update" | "update-available" | "downloading" | "installing" | "error";

const RELEASES_URL = "https://github.com/corp-0/PuduLauncher/releases/latest";

interface UpdateContextValue {
    status: UpdateStatus;
    currentVersion: string;
    newVersion: string | null;
}

const UpdateContext = createContext<UpdateContextValue | undefined>(undefined);

function isWindows(): boolean {
    return navigator.platform === "Win32";
}

export function UpdateContextProvider(props: PropsWithChildren) {
    const { children } = props;
    const feedbackContext = useContext(FeedbackContext);
    const showError = feedbackContext?.showError ?? (() => {});

    const [status, setStatus] = useState<UpdateStatus>("checking");
    const [currentVersion, setCurrentVersion] = useState("");
    const [pendingUpdate, setPendingUpdate] = useState<Update | null>(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadTotal, setDownloadTotal] = useState(0);

    useEffect(() => {
        let disposed = false;

        void (async () => {
            try {
                const version = await getVersion();
                if (!disposed) setCurrentVersion(version);
            } catch {
                if (!disposed) setCurrentVersion("unknown");
            }

            try {
                const update = await check();

                if (disposed) return;

                if (update) {
                    setPendingUpdate(update);
                    setStatus("update-available");
                } else {
                    setStatus("no-update");
                }
            } catch (error: unknown) {
                if (disposed) return;
                setStatus("no-update");
                showError({
                    source: "frontend.updater.check",
                    userMessage: "Failed to check for updates.",
                    code: "UPDATE_CHECK_FAILED",
                    technicalDetails: error instanceof Error ? error.message : String(error),
                    isTransient: true,
                });
            }
        })();

        return () => { disposed = true; };
    }, [showError]);

    const startUpdate = () => {
        if (!pendingUpdate) return;

        setStatus("downloading");

        void (async () => {
            try {
                await pendingUpdate.downloadAndInstall((event) => {
                    switch (event.event) {
                        case "Started":
                            setDownloadTotal(event.data.contentLength ?? 0);
                            setDownloadProgress(0);
                            break;
                        case "Progress":
                            setDownloadProgress((prev) => prev + event.data.chunkLength);
                            break;
                        case "Finished":
                            setStatus("installing");
                            break;
                    }
                });

                // On Windows, the app auto-exits during install (NSIS limitation).
                // On other platforms, relaunch manually.
                await relaunch();
            } catch (error: unknown) {
                setStatus("error");
                showError({
                    source: "frontend.updater.install",
                    userMessage: "Update failed. Please try downloading manually from the releases page.",
                    code: "UPDATE_INSTALL_FAILED",
                    technicalDetails: error instanceof Error ? error.message : String(error),
                });
            }
        })();
    };

    const openReleasesPage = () => {
        void openUrl(RELEASES_URL);
    };

    const value: UpdateContextValue = {
        status,
        currentVersion,
        newVersion: pendingUpdate?.version ?? null,
    };

    const needsUpdate = status !== "checking" && status !== "no-update";

    return (
        <UpdateContext.Provider value={value}>
            {needsUpdate ? (
                <UpdateLayout
                    status={status as "update-available" | "downloading" | "installing" | "error"}
                    currentVersion={currentVersion}
                    newVersion={pendingUpdate?.version ?? ""}
                    downloadProgress={downloadProgress}
                    downloadTotal={downloadTotal}
                    releaseNotes={pendingUpdate?.body ?? null}
                    canAutoUpdate={isWindows()}
                    onStartUpdate={startUpdate}
                    onOpenReleasesPage={openReleasesPage}
                />
            ) : children}
        </UpdateContext.Provider>
    );
}

export function useUpdateContext() {
    const context = useContext(UpdateContext);

    if (context === undefined) {
        throw new Error("useUpdateContext must be used within an UpdateContextProvider.");
    }

    return context;
}
