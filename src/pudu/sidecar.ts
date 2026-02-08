import { invoke } from '@tauri-apps/api/core';

let cachedPort: number | null = null;

const isTauri = '__TAURI_INTERNALS__' in window;

/**
 * Returns the sidecar port, fetching it from the Rust backend on first call.
 * In standalone dev mode (no Tauri), reads from VITE_SIDECAR_PORT env var.
 */
export async function getSidecarPort(): Promise<number> {
  if (cachedPort) return cachedPort;

  if (!isTauri) {
    const envPort = import.meta.env.VITE_SIDECAR_PORT;
    if (!envPort) {
      throw new Error('Running outside Tauri: set VITE_SIDECAR_PORT in .env.local');
    }
    cachedPort = Number(envPort);
    return cachedPort;
  }

  const maxRetries = 20;
  const retryDelay = 500;

  for (let i = 0; i < maxRetries; i++) {
    try {
      cachedPort = await invoke<number>('get_sidecar_port');
      return cachedPort;
    } catch {
      // Sidecar not ready yet, wait and retry
      await new Promise((r) => setTimeout(r, retryDelay));
    }
  }

  throw new Error('Sidecar did not start in time');
}

export async function getSidecarBaseUrl(): Promise<string> {
  const port = await getSidecarPort();
  return `http://localhost:${port}`;
}

export async function getSidecarWsUrl(): Promise<string> {
  const port = await getSidecarPort();
  return `ws://localhost:${port}`;
}
