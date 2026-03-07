import {
    type PropsWithChildren,
    useEffect,
    useRef,
    useState,
} from "react";
import { EventListener } from "../pudu/events/event-listener";
import type { PuduEventMap, PuduEventType } from "../pudu/generated";
import { DiscordApi, type DiscordJoinRequestEvent } from "../pudu/generated";
import { devBridge } from "../devtools/bridge";
import { useFeedbackContext } from "./FeedbackContextProvider";
import DiscordJoinDialog from "../components/molecules/discord/DiscordJoinDialog";

const isTauri = "__TAURI_INTERNALS__" in window;

async function focusWindow() {
    if (!isTauri) return;
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    await win.unminimize();
    await win.setFocus();
}

const DiscordJoinStatus = {
    InstallRequired: 0,
    ServerNotFound: 1,
} as const;

export function DiscordJoinContextProvider(props: PropsWithChildren) {
    const { children } = props;
    const [joinRequest, setJoinRequest] = useState<DiscordJoinRequestEvent | null>(null);
    const [accepting, setAccepting] = useState(false);
    const { showWarning, showError } = useFeedbackContext();

    const showWarningRef = useRef(showWarning);
    showWarningRef.current = showWarning;
    const showErrorRef = useRef(showError);
    showErrorRef.current = showError;

    useEffect(() => {
        const listener = new EventListener();

        let unregisterInjector: (() => void) | undefined;
        if (devBridge) {
            unregisterInjector = devBridge.registerEventInjector((eventType, data) => {
                listener.injectEvent(eventType as PuduEventType, data as PuduEventMap[PuduEventType]);
            });
        }

        listener.on("discord:join-request", (event: DiscordJoinRequestEvent) => {
            void focusWindow();

            if (event.status === DiscordJoinStatus.ServerNotFound) {
                showWarningRef.current({
                    message: "Discord join failed",
                    detail: `Server ${event.serverIp}:${event.serverPort} is not available.`,
                });
                return;
            }

            if (event.status === DiscordJoinStatus.InstallRequired) {
                setJoinRequest(event);
            }
        });

        return () => {
            unregisterInjector?.();
            listener.disconnect();
        };
    }, []);

    const handleAccept = async () => {
        if (!joinRequest) return;

        setAccepting(true);
        try {
            const api = new DiscordApi();
            const result = await api.acceptDiscordJoin({
                serverIp: joinRequest.serverIp,
                serverPort: joinRequest.serverPort,
            });

            if (!result.success) {
                showErrorRef.current({
                    source: "Discord",
                    userMessage: result.error ?? "Failed to join server.",
                });
            }
        } catch (error) {
            showErrorRef.current({
                source: "Discord",
                userMessage: error instanceof Error ? error.message : "Failed to join server.",
            });
        } finally {
            setAccepting(false);
            setJoinRequest(null);
        }
    };

    const handleDismiss = () => {
        setJoinRequest(null);
    };

    return (
        <>
            {children}
            <DiscordJoinDialog
                open={joinRequest !== null}
                serverName={joinRequest?.serverName}
                forkName={joinRequest?.forkName ?? ""}
                buildVersion={joinRequest?.buildVersion ?? 0}
                gameMode={joinRequest?.gameMode}
                currentMap={joinRequest?.currentMap}
                playerCount={joinRequest?.playerCount ?? 0}
                playerCountMax={joinRequest?.playerCountMax ?? 0}
                accepting={accepting}
                onAccept={() => void handleAccept()}
                onDismiss={handleDismiss}
            />
        </>
    );
}
