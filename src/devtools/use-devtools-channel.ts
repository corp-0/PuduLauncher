import { useEffect, useRef, useState } from "react";
import type { DevToolsCommand, DevToolsReport, MockConfig, RequestLogEntry } from "./protocol";
import { DEVTOOLS_CHANNEL } from "./protocol";

export interface DevToolsChannelState {
    requestLog: RequestLogEntry[];
    stateSnapshot: Record<string, unknown> | null;
    mocks: MockConfig[];
}

export interface DevToolsChannelActions {
    sendCommand: (command: DevToolsCommand) => void;
    addMock: (endpoint: string, response: unknown) => void;
    removeMock: (endpoint: string) => void;
    clearAllMocks: () => void;
    injectEvent: (eventType: string, data: unknown) => void;
    requestStateSnapshot: () => void;
    clearLog: () => void;
}

const MAX_LOG_ENTRIES = 500;

export function useDevToolsChannel(): DevToolsChannelState & DevToolsChannelActions {
    const channelRef = useRef<BroadcastChannel | null>(null);
    const [requestLog, setRequestLog] = useState<RequestLogEntry[]>([]);
    const [stateSnapshot, setStateSnapshot] = useState<Record<string, unknown> | null>(null);
    const [mocks, setMocks] = useState<MockConfig[]>([]);

    useEffect(() => {
        const channel = new BroadcastChannel(DEVTOOLS_CHANNEL);
        channelRef.current = channel;

        channel.onmessage = (event: MessageEvent<DevToolsReport>) => {
            const report = event.data;
            switch (report.type) {
                case "request-logged":
                    setRequestLog((prev) => {
                        const next = [report.entry, ...prev];
                        return next.length <= MAX_LOG_ENTRIES ? next : next.slice(0, MAX_LOG_ENTRIES);
                    });
                    break;
                case "state-snapshot":
                    setStateSnapshot(report.sources);
                    break;
            }
        };

        return () => {
            channel.close();
            channelRef.current = null;
        };
    }, []);

    const sendCommand = (command: DevToolsCommand) => {
        channelRef.current?.postMessage(command);
    };

    const addMock = (endpoint: string, response: unknown) => {
        sendCommand({ type: "mock-endpoint", endpoint, response });
        setMocks((prev) => {
            const filtered = prev.filter((m) => m.endpoint !== endpoint);
            return [...filtered, { endpoint, response }];
        });
    };

    const removeMock = (endpoint: string) => {
        sendCommand({ type: "clear-mock", endpoint });
        setMocks((prev) => prev.filter((m) => m.endpoint !== endpoint));
    };

    const clearAllMocks = () => {
        sendCommand({ type: "clear-all-mocks" });
        setMocks([]);
    };

    const injectEvent = (eventType: string, data: unknown) => {
        sendCommand({ type: "inject-event", eventType, data });
    };

    const requestStateSnapshot = () => {
        sendCommand({ type: "request-state-snapshot" });
    };

    const clearLog = () => {
        setRequestLog([]);
    };

    return {
        requestLog,
        stateSnapshot,
        mocks,
        sendCommand,
        addMock,
        removeMock,
        clearAllMocks,
        injectEvent,
        requestStateSnapshot,
        clearLog,
    };
}
