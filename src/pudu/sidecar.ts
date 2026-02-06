import { invoke } from '@tauri-apps/api/core';

let cachedPort: number | null = null;

/**
 * Returns the sidecar port, fetching it from the Rust backend on first call.
 * Retries a few times since the sidecar starts asynchronously.
 */
export async function getSidecarPort(): Promise<number> {
  if (cachedPort) return cachedPort;

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
