import { useEffect, useRef, useState } from "react";
import { useGrpcClient } from "../grpc/GrpcClientProvider";
import { LaunchReply, ProgressUpdate, StatusReply } from "../grpc/launcher_pb";
import "../App.css";

export const DemoPage = () => {
  const client = useGrpcClient();
  const [status, setStatus] = useState<string | null>(null);
  const [jobId, setJobId] = useState("demo-job");
  const [launchMessage, setLaunchMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [streaming, setStreaming] = useState(false);
  const streamAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      streamAbort.current?.abort();
    };
  }, []);

  const handleStatus = async () => {
    const res = (await client.singleResponse({})) as StatusReply;
    setStatus(`${res.state ?? "unknown"} (v${res.version ?? "n/a"})`);
  };

  const handleLaunch = async () => {
    const res = (await client.launchJob({ jobId })) as LaunchReply;
    setLaunchMessage(res.message ?? "Launched");
  };

  const stopProgress = () => {
    streamAbort.current?.abort();
    streamAbort.current = null;
  };

  const handleProgressStream = async () => {
    stopProgress();
    const abort = new AbortController();
    streamAbort.current = abort;
    setStreaming(true);
    setProgress(null);

    try {
      const stream = client.streamProgress(
        { jobId },
        { signal: abort.signal }
      );

      for await (const update of stream) {
        setProgress(update);
        if ((update.percent ?? 0) >= 100) {
          break;
        }
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        console.error("Stream error", err);
      }
    } finally {
      setStreaming(false);
    }
  };

  return (
    <main className="app">
      <h1>PuduLauncher gRPC Demo</h1>
      <p>
        Calls the local gRPC-Web endpoint at <code>http://localhost:5100</code>.
      </p>

      <section className="card">
        <h2>Ping</h2>
        <button onClick={handleStatus}>Get Status</button>
        <div className="result">{status ?? "No status yet"}</div>
      </section>

      <section className="card">
        <h2>Launch job</h2>
        <div className="actions">
          <input
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="job id"
          />
          <button onClick={handleLaunch}>Send launch</button>
        </div>
        <div className="result">{launchMessage ?? "No launch yet"}</div>
      </section>

      <section className="card">
        <h2>Progress Stream</h2>
        <div className="actions">
          <button disabled={streaming} onClick={handleProgressStream}>
            {streaming ? "Streaming..." : "Start stream"}
          </button>
          <button onClick={stopProgress} disabled={!streaming}>
            Stop
          </button>
        </div>
        <ul className="result list">
          {progress === null && <li>No updates yet</li>}
          {progress !== null && (
            <li key={progress.jobId ?? "progress"}>
              {progress.jobId}: {progress.percent}% — {progress.status}
            </li>
          )}
        </ul>
      </section>
    </main>
  );
};
