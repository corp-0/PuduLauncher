import type { DevToolsCommand, DevToolsReport, RequestLogEntry } from "./protocol";
import { DEVTOOLS_CHANNEL } from "./protocol";

type StateSource = () => unknown;

class DevToolsBridgeImpl {
  private channel: BroadcastChannel;
  private mocks = new Map<string, unknown>();
  private stateSources = new Map<string, StateSource>();
  private eventInjectors = new Set<(eventType: string, data: unknown) => void>();

  constructor() {
    this.channel = new BroadcastChannel(DEVTOOLS_CHANNEL);
    this.channel.onmessage = (event: MessageEvent<DevToolsCommand>) => {
      this.handleCommand(event.data);
    };
  }

  private handleCommand(command: DevToolsCommand): void {
    switch (command.type) {
      case "mock-endpoint":
        this.mocks.set(command.endpoint, command.response);
        break;
      case "clear-mock":
        this.mocks.delete(command.endpoint);
        break;
      case "clear-all-mocks":
        this.mocks.clear();
        break;
      case "inject-event":
        for (const injector of this.eventInjectors) {
          injector(command.eventType, command.data);
        }
        this.report({
          type: "event-injected",
          eventType: command.eventType,
          data: command.data,
          timestamp: Date.now(),
        });
        break;
      case "request-state-snapshot": {
        const sources: Record<string, unknown> = {};
        for (const [name, fn] of this.stateSources) {
          try {
            sources[name] = fn();
          } catch {
            sources[name] = { error: "Failed to collect state" };
          }
        }
        this.report({ type: "state-snapshot", sources });
        break;
      }
    }
  }

  report(message: DevToolsReport): void {
    this.channel.postMessage(message);
  }

  getMock(endpoint: string): unknown | undefined {
    return this.mocks.get(endpoint);
  }

  hasMock(endpoint: string): boolean {
    return this.mocks.has(endpoint);
  }

  registerStateSource(name: string, fn: StateSource): () => void {
    this.stateSources.set(name, fn);
    return () => {
      this.stateSources.delete(name);
    };
  }

  registerEventInjector(fn: (eventType: string, data: unknown) => void): () => void {
    this.eventInjectors.add(fn);
    return () => {
      this.eventInjectors.delete(fn);
    };
  }

  logRequest(entry: RequestLogEntry): void {
    this.report({ type: "request-logged", entry });
  }

  dispose(): void {
    this.channel.close();
  }
}

// Singleton, only created in dev
export const devBridge: DevToolsBridgeImpl | null =
  import.meta.env.DEV ? new DevToolsBridgeImpl() : null;
