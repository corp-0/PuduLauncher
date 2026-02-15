import {
    createContext,
    type PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import FatalErrorModal from "../components/molecules/errors/FatalErrorModal";
import ErrorSnackbar from "../components/molecules/errors/ErrorSnackbar";
import { ErrorDisplayApi, type FrontendErrorEvent } from "../pudu/generated";
import { EventListener } from "../pudu/events/event-listener";
import { invoke } from "@tauri-apps/api/core";

type ErrorSeverity = "error" | "fatal";

interface ErrorReportInput {
    source: string;
    userMessage: string;
    code?: string | null;
    technicalDetails?: string | null;
    correlationId?: string | null;
    isTransient?: boolean;
    dedupe?: boolean;
}

interface ErrorDisplayItem {
    id: string;
    severity: ErrorSeverity;
    source: string;
    userMessage: string;
    code?: string | null;
    technicalDetails?: string | null;
    correlationId?: string | null;
    isTransient: boolean;
    timestamp: string;
}

interface ErrorContextValue {
    showError: (input: ErrorReportInput) => void;
    showFatal: (input: ErrorReportInput) => void;
    clearFatal: () => void;
    recentErrors: ErrorDisplayItem[];
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

const DEDUPE_WINDOW_MS = 30_000;
const MAX_RECENT_ERRORS = 100;

function createId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildFingerprint(error: Pick<ErrorDisplayItem, "severity" | "source" | "code" | "userMessage">) {
    return `${error.severity}|${error.source}|${error.code ?? ""}|${error.userMessage}`;
}

function normalizeSeverity(rawSeverity: string | undefined): ErrorSeverity {
    return rawSeverity === "fatal" ? "fatal" : "error";
}

function mapEventToDisplayItem(event: FrontendErrorEvent): ErrorDisplayItem {
    return {
        id: event.id ?? createId(),
        severity: normalizeSeverity(event.severity),
        source: event.source,
        userMessage: event.userMessage,
        code: event.code,
        technicalDetails: event.technicalDetails,
        correlationId: event.correlationId,
        isTransient: event.isTransient ?? true,
        timestamp: event.timestamp,
    };
}

function buildTrace(error: ErrorDisplayItem) {
    const parts = [
        `Time: ${error.timestamp}`,
        `Severity: ${error.severity}`,
        `Source: ${error.source}`,
        `Code: ${error.code ?? "n/a"}`,
        `CorrelationId: ${error.correlationId ?? "n/a"}`,
        `Message: ${error.userMessage}`,
        "",
        "Technical details:",
        error.technicalDetails ?? "n/a",
    ];

    return parts.join("\n");
}

export function ErrorContextProvider(props: PropsWithChildren) {
    const { children } = props;
    const [recentErrors, setRecentErrors] = useState<ErrorDisplayItem[]>([]);
    const [snackbarQueue, setSnackbarQueue] = useState<ErrorDisplayItem[]>([]);
    const [fatalError, setFatalError] = useState<ErrorDisplayItem | null>(null);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
    const fingerprintsRef = useRef<Map<string, number>>(new Map());

    const pushError = useCallback((error: ErrorDisplayItem, dedupe = true) => {
        if (dedupe) {
            const now = Date.now();
            const fingerprint = buildFingerprint(error);
            const lastSeen = fingerprintsRef.current.get(fingerprint);

            if (lastSeen !== undefined && now - lastSeen < DEDUPE_WINDOW_MS) {
                return;
            }

            fingerprintsRef.current.set(fingerprint, now);
        }

        setRecentErrors((prev) => {
            const next = [...prev, error];
            if (next.length <= MAX_RECENT_ERRORS) {
                return next;
            }

            return next.slice(next.length - MAX_RECENT_ERRORS);
        });

        if (error.severity === "fatal") {
            setFatalError(error);
            return;
        }

        setSnackbarQueue((prev) => [...prev, error]);
    }, []);

    const showError = useCallback((input: ErrorReportInput) => {
        pushError({
            id: createId(),
            severity: "error",
            source: input.source,
            userMessage: input.userMessage,
            code: input.code,
            technicalDetails: input.technicalDetails,
            correlationId: input.correlationId,
            isTransient: input.isTransient ?? true,
            timestamp: new Date().toISOString(),
        }, input.dedupe ?? true);
    }, [pushError]);

    const showFatal = useCallback((input: ErrorReportInput) => {
        pushError({
            id: createId(),
            severity: "fatal",
            source: input.source,
            userMessage: input.userMessage,
            code: input.code,
            technicalDetails: input.technicalDetails,
            correlationId: input.correlationId,
            isTransient: false,
            timestamp: new Date().toISOString(),
        }, input.dedupe ?? true);
    }, [pushError]);

    const clearFatal = useCallback(() => {
        setFatalError(null);
        setCopyFeedback(null);
    }, []);

    const dismissSnackbar = useCallback(() => {
        setSnackbarQueue((prev) => prev.slice(1));
    }, []);

    const openLogDirectory = useCallback(() => {
        void invoke("open_log_directory");
    }, []);

    const copyTrace = useCallback(async () => {
        if (!fatalError) {
            return;
        }

        try {
            await navigator.clipboard.writeText(buildTrace(fatalError));
            setCopyFeedback("Trace copied");
        } catch {
            setCopyFeedback("Failed to copy trace");
        }
    }, [fatalError]);

    useEffect(() => {
        const listener = new EventListener();

        listener.on("frontend:error", (event) => {
            pushError(mapEventToDisplayItem(event));
        });

        return () => {
            listener.disconnect();
        };
    }, [pushError]);

    useEffect(() => {
        const api = new ErrorDisplayApi();

        void api.getRecentErrors()
            .then((result) => {
                if (!result.success || !result.data) {
                    return;
                }

                for (const error of result.data) {
                    pushError(mapEventToDisplayItem(error));
                }
            })
            .catch(() => {
                // Ignore bootstrap errors here; this provider is itself error infrastructure.
            });
    }, [pushError]);

    useEffect(() => {
        const onError = (event: ErrorEvent) => {
            const details = event.error instanceof Error
                ? event.error.stack ?? event.error.message
                : event.message;

            showFatal({
                source: "frontend.window-error",
                userMessage: event.message || "Unhandled frontend error.",
                code: "FRONTEND_UNHANDLED_ERROR",
                technicalDetails: details,
            });
        };

        const onUnhandledRejection = (event: PromiseRejectionEvent) => {
            const reason = event.reason;
            const details = reason instanceof Error
                ? reason.stack ?? reason.message
                : String(reason);

            showFatal({
                source: "frontend.unhandled-rejection",
                userMessage: "Unhandled promise rejection.",
                code: "FRONTEND_UNHANDLED_REJECTION",
                technicalDetails: details,
            });
        };

        window.addEventListener("error", onError);
        window.addEventListener("unhandledrejection", onUnhandledRejection);

        return () => {
            window.removeEventListener("error", onError);
            window.removeEventListener("unhandledrejection", onUnhandledRejection);
        };
    }, [showFatal]);

    const value = useMemo<ErrorContextValue>(() => ({
        showError,
        showFatal,
        clearFatal,
        recentErrors,
    }), [clearFatal, recentErrors, showError, showFatal]);

    const currentSnackbar = snackbarQueue[0] ?? null;
    const fatalTrace = fatalError ? buildTrace(fatalError) : "";

    return (
        <ErrorContext.Provider value={value}>
            {children}

            <ErrorSnackbar
                error={currentSnackbar}
                onClose={dismissSnackbar}
                onSeeLogs={openLogDirectory}
            />

            <FatalErrorModal
                error={fatalError}
                trace={fatalTrace}
                copyFeedback={copyFeedback}
                onCopyTrace={copyTrace}
                onDismiss={clearFatal}
                onSeeLogs={openLogDirectory}
            />
        </ErrorContext.Provider>
    );
}

export function useErrorContext() {
    const context = useContext(ErrorContext);

    if (context === undefined) {
        throw new Error("useErrorContext must be used within a ErrorContextProvider.");
    }

    return context;
}
