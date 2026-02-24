import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import {
    Alert,
    Box,
    Button,
    CssBaseline,
    CssVarsProvider,
    GlobalStyles,
    Stack,
    Typography,
} from "@mui/joy";
import { IpcApi } from "../../pudu/generated";
import { useThemeContext } from "../../contextProviders/ThemeProvider";
import { themeRegistry, themeScrollbarRegistry } from "../../themes";
import { log } from "../../pudu/log";

const isTauri = "__TAURI_INTERNALS__" in window;
const POPUP_WIDTH = 420;

const requestTypeDescriptions: Record<string, (domain: string) => string> = {
    "1": (domain) =>
        `The game wants to open the following URL in your browser: ${domain}`,
    "2": (domain) =>
        `The game wants to send API requests to the following domain: ${domain}`,
    "3": () =>
        "The game is requesting trusted mode. This automatically allows every API and URL " +
        "action without prompts, and enables the Variable Viewer which can modify game data " +
        "and could potentially perform unwanted actions on your PC.",
    "4": () =>
        "The game wants to access your microphone while it is running.",
};

export default function IpcPermissionPage() {
    const { themeId } = useThemeContext();
    const [searchParams] = useSearchParams();
    const [responding, setResponding] = useState(false);
    const apiRef = useRef(new IpcApi());

    const requestId = searchParams.get("requestId") ?? "";
    const requestType = searchParams.get("requestType") ?? "";
    const domain = searchParams.get("domain") ?? "";
    const justification = searchParams.get("justification") ?? "";

    const description = requestTypeDescriptions[requestType]?.(domain) ?? "The game made an unknown request.";
    const isDangerous = requestType === "3";

    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!requestId) {
            log.error("IPC permission page opened without requestId");
        }
    }, [requestId]);

    // Resize the window to fit content after styles have been applied.
    useEffect(() => {
        if (!isTauri || !rootRef.current) return;

        const el = rootRef.current;

        // MUI Joy injects styles asynchronously — a ResizeObserver catches the
        // final layout regardless of how many paints it takes.
        const ro = new ResizeObserver(() => {
            const height = el.scrollHeight;
            if (height === 0) return;

            ro.disconnect();

            void (async () => {
                const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
                const { LogicalSize } = await import("@tauri-apps/api/dpi");
                const win = getCurrentWebviewWindow();
                await win.setSize(new LogicalSize(POPUP_WIDTH, height));
                await win.center();
            })();
        });
        ro.observe(el);

        return () => ro.disconnect();
    }, []);

    const handleDrag = (e: React.MouseEvent) => {
        if (!isTauri || e.button !== 0) return;
        e.preventDefault();
        void (async () => {
            const { getCurrentWindow } = await import("@tauri-apps/api/window");
            await getCurrentWindow().startDragging();
        })();
    };

    const handleRespond = (allowed: boolean) => {
        if (!requestId || responding) return;
        setResponding(true);

        void (async () => {
            try {
                await apiRef.current.respondToRequest({ requestId, allowed });
            } catch (err) {
                log.error(`Failed to send IPC response: ${err}`);
            }

            if (isTauri) {
                const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
                await getCurrentWebviewWindow().close();
            }
        })();
    };

    return (
        <CssVarsProvider defaultMode="dark" modeStorageKey="pudu-color-mode" theme={themeRegistry[themeId]}>
            <CssBaseline />
            <GlobalStyles styles={themeScrollbarRegistry[themeId]} />
            <Box ref={rootRef}>
            <Box
                onMouseDown={handleDrag}
                sx={{
                    cursor: "grab",
                    userSelect: "none",
                }}
            >
                <Alert
                    color={isDangerous ? "danger" : "warning"}
                    variant="soft"
                >
                    Game Permission Request
                </Alert>
            </Box>
            <Stack spacing={2} sx={{ p: 3, boxSizing: "border-box" }}>
                <Typography level="body-md">
                    {description}
                </Typography>

                {justification && (
                    <Stack spacing={0.5}>
                        <Typography level="body-sm" fontWeight="lg">
                            Justification from the game:
                        </Typography>
                        <Typography level="body-sm" sx={{
                            p: 1.5,
                            borderRadius: "sm",
                            bgcolor: "background.level1",
                            fontStyle: "italic",
                        }}>
                            {justification}
                        </Typography>
                    </Stack>
                )}

                {isDangerous && (
                    <Alert color="danger" variant="outlined" size="sm">
                        The text above was provided by the game, not by PuduLauncher.
                        Treat it with caution.
                    </Alert>
                )}

                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: "auto" }}>
                    <Button
                        variant="outlined"
                        color="neutral"
                        disabled={responding}
                        onClick={() => handleRespond(false)}
                    >
                        Deny
                    </Button>
                    <Button
                        color={isDangerous ? "danger" : "primary"}
                        disabled={responding}
                        onClick={() => handleRespond(true)}
                    >
                        Allow
                    </Button>
                </Stack>
            </Stack>
            </Box>
        </CssVarsProvider>
    );
}
