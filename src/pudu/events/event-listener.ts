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

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = await getSidecarWsUrl();
      this.ws = new WebSocket(`${wsUrl}/events`);

      this.ws.onopen = () => {
        console.log('Connected to event stream');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (msg) => {
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

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('Disconnected from event stream');
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Failed to connect to event stream:', error);
      this.scheduleReconnect();
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
  }

  off<TEventType extends PuduEventType>(
    eventType: TEventType,
    handler?: (event: PuduEventMap[TEventType]) => void
  ): void {
    if (!handler) {
      this.handlers.delete(eventType);
      return;
    }

    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler as EventHandler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = window.setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect();
    }, this.reconnectInterval);
  }
}
