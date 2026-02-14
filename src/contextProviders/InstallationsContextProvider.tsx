import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useInstallationState } from "../hooks/useInstallationState";
import type { DownloadProgressEvent, DownloadStateChangedEvent, RegistryBuild } from "../pudu/generated";
import { InstallationsApi } from "../pudu/generated";
import { EventListener } from "../pudu/events/event-listener";
import { useErrorContext } from "./ErrorContextProvider";

const DownloadState = {
    InProgress: 1,
    Extracting: 2,
    Scanning: 3,
    Installed: 4,
    Failed: 5,
    ScanFailed: 6,
} as const;

export interface RegistryDownloadSnapshot {
    state: number;
    progress: number;
    errorMessage: string | null;
}

interface InstallationCardViewModel {
    id: string;
    forkName: string;
    buildVersion: string;
    lastPlayedAt: string;
    isNewest: boolean;
    onDelete: () => void;
    onPlay: () => void;
}

interface InstallationsContextValue {
    cards: InstallationCardViewModel[];
    isLoading: boolean;
    isEmpty: boolean;
    registryBuilds: RegistryBuild[];
    registryLoading: boolean;
    registryOpen: boolean;
    registryDownloads: Map<number, RegistryDownloadSnapshot>;
    installedBuildVersions: Set<number>;
    openRegistry: () => void;
    closeRegistry: () => void;
    downloadBuild: (buildVersion: number) => void;
}

const InstallationsContext = createContext<InstallationsContextValue | undefined>(undefined);

export function InstallationsContextProvider(props: PropsWithChildren) {
    const { children } = props;
    const { showError } = useErrorContext();
    const { installations, deleteInstallation, launchGame } = useInstallationState();

    const [registryBuilds, setRegistryBuilds] = useState<RegistryBuild[]>([]);
    const [registryLoading, setRegistryLoading] = useState(false);
    const [registryOpen, setRegistryOpen] = useState(false);
    const [registryDownloads, setRegistryDownloads] = useState<Map<number, RegistryDownloadSnapshot>>(new Map());

    const installedBuildVersions = useMemo(() => {
        const set = new Set<number>();
        if (installations) {
            for (const inst of installations) {
                set.add(inst.buildVersion);
            }
        }
        return set;
    }, [installations]);

    useEffect(() => {
        const listener = new EventListener();

        listener.on("download:progress", (event: DownloadProgressEvent) => {
            setRegistryDownloads((prev) => {
                const existing = prev.get(event.buildVersion);
                if (!existing) return prev;
                const next = new Map(prev);
                next.set(event.buildVersion, {
                    ...existing,
                    progress: event.progress,
                });
                return next;
            });
        });

        listener.on("download:state-changed", (event: DownloadStateChangedEvent) => {
            setRegistryDownloads((prev) => {
                const next = new Map(prev);
                if (event.state === DownloadState.Installed) {
                    next.delete(event.buildVersion);
                } else {
                    const existing = prev.get(event.buildVersion);
                    next.set(event.buildVersion, {
                        state: event.state,
                        progress: existing?.progress ?? 0,
                        errorMessage: event.errorMessage ?? null,
                    });
                }
                return next;
            });
        });

        return () => {
            listener.disconnect();
        };
    }, []);

    const openRegistry = useCallback(() => {
        setRegistryOpen(true);
        setRegistryLoading(true);

        const api = new InstallationsApi();
        void api.getRegistryBuilds().then((result) => {
            if (result.success && result.data) {
                setRegistryBuilds(result.data);
            } else {
                showError({
                    source: "frontend.installations.get-registry-builds",
                    userMessage: "Failed to load available builds.",
                    code: "REGISTRY_BUILDS_FETCH_FAILED",
                    technicalDetails: result.error ?? "Unknown backend error.",
                });
            }
            setRegistryLoading(false);
        }).catch((error: unknown) => {
            showError({
                source: "frontend.installations.get-registry-builds",
                userMessage: "Failed to load available builds.",
                code: "REGISTRY_BUILDS_FETCH_EXCEPTION",
                technicalDetails: error instanceof Error ? error.toString() : String(error),
            });
            setRegistryLoading(false);
        });
    }, [showError]);

    const closeRegistry = useCallback(() => {
        setRegistryOpen(false);
    }, []);

    const downloadBuild = useCallback((buildVersion: number) => {
        setRegistryDownloads((prev) => {
            const next = new Map(prev);
            next.set(buildVersion, {
                state: DownloadState.InProgress,
                progress: 0,
                errorMessage: null,
            });
            return next;
        });

        const api = new InstallationsApi();
        void api.downloadVersion(buildVersion).then((result) => {
            if (result.success) return;

            setRegistryDownloads((prev) => {
                const next = new Map(prev);
                next.set(buildVersion, {
                    state: DownloadState.Failed,
                    progress: 0,
                    errorMessage: result.error ?? "Unknown backend error.",
                });
                return next;
            });

            showError({
                source: "frontend.installations.download-version",
                userMessage: "Failed to start download.",
                code: "DOWNLOAD_VERSION_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
                dedupe: false,
            });
        }).catch((error: unknown) => {
            const errorMessage = error instanceof Error ? error.toString() : String(error);

            setRegistryDownloads((prev) => {
                const next = new Map(prev);
                next.set(buildVersion, {
                    state: DownloadState.Failed,
                    progress: 0,
                    errorMessage,
                });
                return next;
            });

            showError({
                source: "frontend.installations.download-version",
                userMessage: "Failed to start download.",
                code: "DOWNLOAD_VERSION_EXCEPTION",
                technicalDetails: errorMessage,
                dedupe: false,
            });
        });
    }, [showError]);

    const cards = useMemo<InstallationCardViewModel[]>(() => {
        if (!installations) {
            return [];
        }

        const newestByFork = new Map<string, number>();
        for (const inst of installations) {
            const current = newestByFork.get(inst.forkName);
            if (current === undefined || inst.buildVersion > current) {
                newestByFork.set(inst.forkName, inst.buildVersion);
            }
        }

        const sorted = [...installations].sort((a, b) => {
            const forkCompare = a.forkName.localeCompare(b.forkName);
            if (forkCompare !== 0) return forkCompare;
            return b.buildVersion - a.buildVersion;
        });

        return sorted.map((inst) => ({
            id: inst.id,
            forkName: inst.forkName,
            buildVersion: String(inst.buildVersion),
            lastPlayedAt: inst.lastPlayedDate,
            isNewest: inst.buildVersion === newestByFork.get(inst.forkName),
            onDelete: () => deleteInstallation(inst.id),
            onPlay: () => launchGame(inst.id),
        }));
    }, [installations, deleteInstallation, launchGame]);

    const value = useMemo<InstallationsContextValue>(() => ({
        cards,
        isLoading: installations === null,
        isEmpty: installations !== null && installations.length === 0,
        registryBuilds,
        registryLoading,
        registryOpen,
        registryDownloads,
        installedBuildVersions,
        openRegistry,
        closeRegistry,
        downloadBuild,
    }), [cards, installations, registryBuilds, registryLoading, registryOpen, registryDownloads, installedBuildVersions, openRegistry, closeRegistry, downloadBuild]);

    return (
        <InstallationsContext.Provider value={value}>
            {children}
        </InstallationsContext.Provider>
    );
}

export function useInstallationsContext() {
    const context = useContext(InstallationsContext);

    if (context === undefined) {
        throw new Error("useInstallationsContext must be used within an InstallationsContextProvider.");
    }

    return context;
}
