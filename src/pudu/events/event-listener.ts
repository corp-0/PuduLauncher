import type { EventBase, PuduEvent, PuduEventMap, PuduEventType } from '../generated/types';
import { getSidecarWsUrl } from '../sidecar';

/**
 * WebSocket-based event listener for receiving real-time events from the sidecar.
 */
type EventHandler = (event: PuduEvent) => void;

export class EventListener {
  private ws: WebSocket | null = null;
  private handlers = new Map<PuduEventType, EventHandler[]>();
  private reconnectInterval = 3000;
  private reconnectTimer: number | null = null;
  private shouldReconnect = true;
  private connectionSession = 0;

  async connect(): Promise<void> {
    this.shouldReconnect = true;
    const session = this.connectionSession;

    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const wsUrl = await getSidecarWsUrl();
      if (!this.shouldReconnect || session !== this.connectionSession) {
        return;
      }

      const ws = new WebSocket(`${wsUrl}/events`);
      this.ws = ws;

      ws.onopen = () => {
        if (!this.shouldReconnect || session !== this.connectionSession) {
          ws.close();
          return;
        }

        console.log('Connected to event stream');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      ws.onmessage = (msg) => {
        try {
          const event = JSON.parse(msg.data) as EventBase;
          const eventType = event.eventType as PuduEventType;
          const handlers = this.handlers.get(eventType);

          if (handlers) {
            handlers.forEach((handler) => handler(event as PuduEvent));
          } else {
            console.log('Unhandled event type:', event.eventType);
          }
        } catch (error) {
          console.error('Error parsing event:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        if (this.ws === ws) {
          this.ws = null;
        }

        console.log('Disconnected from event stream');
        if (this.shouldReconnect && session === this.connectionSession) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('Failed to connect to event stream:', error);
      if (this.shouldReconnect && session === this.connectionSession) {
        this.scheduleReconnect();
      }
    }
  }

  on<TEventType extends PuduEventType>(
    eventType: TEventType,
    handler: (event: PuduEventMap[TEventType]) => void
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    this.handlers.get(eventType)!.push(handler as EventHandler);
    void this.connect();
  }

  off<TEventType extends PuduEventType>(
    eventType: TEventType,
    handler?: (event: PuduEventMap[TEventType]) => void
  ): void {
    if (!handler) {
      this.handlers.delete(eventType);
      if (!this.hasHandlers()) {
        this.disconnect();
      }
      return;
    }

    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler as EventHandler);
      if (index !== -1) {
        handlers.splice(index, 1);
        if (handlers.length === 0) {
          this.handlers.delete(eventType);
        }
      }
    }

    if (!this.hasHandlers()) {
      this.disconnect();
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.connectionSession += 1;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    const session = this.connectionSession;

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;

      if (!this.shouldReconnect || session !== this.connectionSession) {
        return;
      }

      console.log('Attempting to reconnect...');
      this.connect();
    }, this.reconnectInterval);
  }

  private hasHandlers(): boolean {
    for (const handlers of this.handlers.values()) {
      if (handlers.length > 0) {
        return true;
      }
    }

    return false;
  }
}
