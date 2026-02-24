import {
    type PropsWithChildren,
    useEffect,
    useRef,
} from "react";
import { EventListener } from "../pudu/events/event-listener";
import type { IpcPermissionRequestEvent } from "../pudu/generated";
import { log } from "../pudu/log";

const isTauri = "__TAURI_INTERNALS__" in window;

function buildPermissionUrl(event: IpcPermissionRequestEvent): string {
    const params = new URLSearchParams({
        requestId: event.requestId,
        requestType: String(event.requestType),
        domain: event.domain,
        justification: event.justification,
    });
    return `/ipc-permission?${params}`;
}

async function openPermissionPopup(event: IpcPermissionRequestEvent): Promise<void> {
    if (!isTauri) {
        // In non-Tauri dev mode, open as a regular browser popup.
        window.open(buildPermissionUrl(event), "_blank", "width=500,height=420");
        return;
    }

    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const { UserAttentionType } = await import("@tauri-apps/api/window");

    const label = `ipc-permission-${event.requestId.slice(0, 8)}`;

    // Width matches POPUP_WIDTH in IpcPermissionPage. Height is temporary
    // the page measures its content after render and calls setSize to fit.
    const popup = new WebviewWindow(label, {
        url: buildPermissionUrl(event),
        title: "Game Permission Request",
        width: 420,
        height: 200,
        center: true,
        alwaysOnTop: true,
        focus: true,
        resizable: false,
        minimizable: false,
        decorations: false,
    });

    popup.once("tauri://created", () => {
        void popup.requestUserAttention(UserAttentionType.Critical);
    });

    popup.once("tauri://error", (e) => {
        log.error(`Failed to create IPC permission window: ${JSON.stringify(e)}`);
    });
}

export function IpcContextProvider(props: PropsWithChildren) {
    const { children } = props;
    const openedRequestsRef = useRef(new Set<string>());

    useEffect(() => {
        const listener = new EventListener();

        listener.on("ipc:permission-request", (event) => {
            if (openedRequestsRef.current.has(event.requestId)) return;
            openedRequestsRef.current.add(event.requestId);

            log.info(`IPC permission request: type=${event.requestType} domain=${event.domain}`);
            void openPermissionPopup(event);
        });

        return () => {
            listener.disconnect();
        };
    }, []);

    return <>{children}</>;
}
