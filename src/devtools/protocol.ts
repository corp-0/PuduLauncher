export interface RequestLogEntry {
  id: string;
  timestamp: number;
  method: string;
  endpoint: string;
  requestBody: unknown | null;
  responseBody: unknown | null;
  wasMocked: boolean;
  durationMs: number | null;
  error: string | null;
}

export interface MockConfig {
  endpoint: string;
  response: unknown;
}

// Commands: dev panel → main window
export type DevToolsCommand =
  | { type: "mock-endpoint"; endpoint: string; response: unknown }
  | { type: "clear-mock"; endpoint: string }
  | { type: "clear-all-mocks" }
  | { type: "inject-event"; eventType: string; data: unknown }
  | { type: "request-state-snapshot" };

// Reports: main window → dev panel
export type DevToolsReport =
  | { type: "request-logged"; entry: RequestLogEntry }
  | { type: "event-injected"; eventType: string; data: unknown; timestamp: number }
  | { type: "state-snapshot"; sources: Record<string, unknown> };

export type DevToolsMessage = DevToolsCommand | DevToolsReport;

export const DEVTOOLS_CHANNEL = "pudu-devtools";
