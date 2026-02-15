import { useEffect, useState } from "react";
import type { Installation, InstallationsChangedEvent } from "../pudu/generated";
import { GameLaunchApi, InstallationsApi } from "../pudu/generated";
import { EventListener } from "../pudu/events/event-listener";
import { useErrorContext } from "../contextProviders/ErrorContextProvider";

export function useInstallationState() {
    const { showError } = useErrorContext();
    const [installations, setInstallations] = useState<Installation[] | null>(null);

    useEffect(() => {
        void (async () => {
            const api = new InstallationsApi();

            try {
                const result = await api.getInstallations();
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
            } catch (error: unknown) {
                setInstallations([]);
                showError({
                    source: "frontend.installations.get-installations",
                    userMessage: "Failed to load local installations.",
                    code: "INSTALLATIONS_FETCH_EXCEPTION",
                    technicalDetails: error instanceof Error ? error.toString() : String(error),
                });
            }
        })();
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

    const deleteInstallation = async (id: string) => {
        setInstallations((prev) =>
            prev ? prev.filter((i) => i.id !== id) : prev,
        );

        const api = new InstallationsApi();
        try {
            const result = await api.deleteInstallation(id);
            if (result.success) return;

            showError({
                source: "frontend.installations.delete-installation",
                userMessage: "Failed to delete installation.",
                code: "INSTALLATION_DELETE_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
                dedupe: false,
            });
        } catch (error: unknown) {
            showError({
                source: "frontend.installations.delete-installation",
                userMessage: "Failed to delete installation.",
                code: "INSTALLATION_DELETE_EXCEPTION",
                technicalDetails: error instanceof Error ? error.toString() : String(error),
                dedupe: false,
            });
        }
    };

    const launchGame = async (installationId: string) => {
        const api = new GameLaunchApi();
        try {
            const result = await api.launchGame({ installationId });
            if (result.success) return;

            showError({
                source: "frontend.game-launch.launch-game",
                userMessage: "Failed to launch game.",
                code: "GAME_LAUNCH_FAILED",
                technicalDetails: result.error ?? "Unknown backend error.",
                dedupe: false,
            });
        } catch (error: unknown) {
            showError({
                source: "frontend.game-launch.launch-game",
                userMessage: "Failed to launch game.",
                code: "GAME_LAUNCH_EXCEPTION",
                technicalDetails: error instanceof Error ? error.toString() : String(error),
                dedupe: false,
            });
        }
    };

    return {
        installations,
        deleteInstallation,
        launchGame,
    };
}
