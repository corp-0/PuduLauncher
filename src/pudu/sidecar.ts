import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

let cachedPort: number | null = null;
let portPromise: Promise<number> | null = null;

const isTauri = '__TAURI_INTERNALS__' in window;

const SIDECAR_TIMEOUT_MS = 60_000;

/**
 * Returns the sidecar port.
 *
 * In Tauri mode, tries the Rust command first (in case the event already fired),
 * then waits for the `sidecar-ready` Tauri event.
 *
 * In standalone dev mode (no Tauri), reads from VITE_SIDECAR_PORT env var.
 */
export function getSidecarPort(): Promise<number> {
  if (cachedPort) return Promise.resolve(cachedPort);

  if (!isTauri) {
    const envPort = import.meta.env.VITE_SIDECAR_PORT;
    if (!envPort) {
      return Promise.reject(new Error('Running outside Tauri: set VITE_SIDECAR_PORT in .env.local'));
    }
    cachedPort = Number(envPort);
    return Promise.resolve(cachedPort);
  }

  // Deduplicate concurrent callers, one shared promise.
  if (!portPromise) {
    portPromise = discoverPort();
  }

  return portPromise;
}

async function discoverPort(): Promise<number> {
  // The event may have already fired before we loaded. Try the command first.
  try {
    const port = await invoke<number>('get_sidecar_port');
    cachedPort = port;
    return port;
  } catch {
    // Not ready yet fall through to event listener.
  }

  return new Promise<number>((resolve, reject) => {
    let settled = false;

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('Sidecar did not start in time'));
      }
    }, SIDECAR_TIMEOUT_MS);

    void listen<number>('sidecar-ready', (event) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      cachedPort = event.payload;
      resolve(event.payload);
    });
  });
}

export async function getSidecarBaseUrl(): Promise<string> {
  const port = await getSidecarPort();
  return `http://localhost:${port}`;
}

export async function getSidecarWsUrl(): Promise<string> {
  const port = await getSidecarPort();
  return `ws://localhost:${port}`;
}
