import { useCallback, useEffect, useState } from "react";
import type { Installation, InstallationsChangedEvent } from "../pudu/generated";
import { GameLaunchApi, InstallationsApi } from "../pudu/generated";
import { EventListener } from "../pudu/events/event-listener";
import { useErrorContext } from "../contextProviders/ErrorContextProvider";

export function useInstallationState() {
    const { showError } = useErrorContext();
    const [installations, setInstallations] = useState<Installation[] | null>(null);

    useEffect(() => {
        const api = new InstallationsApi();

        api.getInstallations().then((result) => {
            if (result.success && result.data) {
                setInstallations(result.data);
                return;
            }

            setInstallations([]);
            showError({
                source: "frontend.installations.get-installations",
                userMessage: "Failed to load local installations.",
                code: "INSTALLATIONS_FETCH_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
            });
        }).catch((error: unknown) => {
            setInstallations([]);
            showError({
                source: "frontend.installations.get-installations",
                userMessage: "Failed to load local installations.",
                code: "INSTALLATIONS_FETCH_EXCEPTION",
                technicalDetails: error instanceof Error ? error.toString() : String(error),
            });
        });
    }, [showError]);

    useEffect(() => {
        const listener = new EventListener();

        listener.on("installations:changed", (event: InstallationsChangedEvent) => {
            setInstallations(event.installations);
        });

        return () => {
            listener.disconnect();
        };
    }, []);

    const deleteInstallation = useCallback((id: string) => {
        setInstallations((prev) =>
            prev ? prev.filter((i) => i.id !== id) : prev,
        );

        const api = new InstallationsApi();
        void api.deleteInstallation(id).then((result) => {
            if (result.success) {
                return;
            }

            showError({
                source: "frontend.installations.delete-installation",
                userMessage: "Failed to delete installation.",
                code: "INSTALLATION_DELETE_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
                dedupe: false,
            });
        }).catch((error: unknown) => {
            showError({
                source: "frontend.installations.delete-installation",
                userMessage: "Failed to delete installation.",
                code: "INSTALLATION_DELETE_EXCEPTION",
                technicalDetails: error instanceof Error ? error.toString() : String(error),
                dedupe: false,
            });
        });
    }, [showError]);

    const launchGame = useCallback((installationId: string) => {
        const api = new GameLaunchApi();
        void api.launchGame({ installationId }).then((result) => {
            if (result.success) {
                return;
            }

            showError({
                source: "frontend.game-launch.launch-game",
                userMessage: "Failed to launch game.",
                code: "GAME_LAUNCH_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
                dedupe: false,
            });
        }).catch((error: unknown) => {
            showError({
                source: "frontend.game-launch.launch-game",
                userMessage: "Failed to launch game.",
                code: "GAME_LAUNCH_EXCEPTION",
                technicalDetails: error instanceof Error ? error.toString() : String(error),
                dedupe: false,
            });
        });
    }, [showError]);

    return {
        installations,
        deleteInstallation,
        launchGame,
    };
}
