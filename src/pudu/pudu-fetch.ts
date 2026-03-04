import { devBridge } from "../devtools/bridge";
import { getSidecarBaseUrl } from "./sidecar";

let idCounter = 0;

export async function puduFetch(
  endpoint: string,
  init?: RequestInit,
): Promise<Response> {
  const baseUrl = await getSidecarBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  if (!import.meta.env.DEV || !devBridge) {
    return fetch(url, init);
  }

  const id = `req-${++idCounter}`;
  const timestamp = Date.now();
  let requestBody: unknown = null;
  if (init?.body && typeof init.body === "string") {
    try {
      requestBody = JSON.parse(init.body);
    } catch {
      requestBody = init.body;
    }
  }

  // Check for mock
  if (devBridge.hasMock(endpoint)) {
    const mockResponse = devBridge.getMock(endpoint);

    devBridge.logRequest({
      id,
      timestamp,
      method: init?.method ?? "GET",
      endpoint,
      requestBody,
      responseBody: mockResponse,
      wasMocked: true,
      durationMs: 0,
      error: null,
    });

    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Real fetch — log in background to avoid delaying the response
  const start = performance.now();
  try {
    const response = await fetch(url, init);
    const durationMs = Math.round(performance.now() - start);

    // Fire-and-forget: clone + log without blocking the caller
    response.clone().json().then(
      (responseBody) => {
        devBridge!.logRequest({
          id,
          timestamp,
          method: init?.method ?? "GET",
          endpoint,
          requestBody,
          responseBody,
          wasMocked: false,
          durationMs,
          error: response.ok ? null : `HTTP ${response.status}`,
        });
      },
      () => {
        devBridge!.logRequest({
          id,
          timestamp,
          method: init?.method ?? "GET",
          endpoint,
          requestBody,
          responseBody: null,
          wasMocked: false,
          durationMs,
          error: response.ok ? null : `HTTP ${response.status}`,
        });
      },
    );

    return response;
  } catch (error) {
    devBridge.logRequest({
      id,
      timestamp,
      method: init?.method ?? "GET",
      endpoint,
      requestBody,
      responseBody: null,
      wasMocked: false,
      durationMs: Math.round(performance.now() - start),
      error: error instanceof Error ? error.message : "Network error",
    });
    throw error;
  }
}
