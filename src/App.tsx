import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { GreeterApi } from "./pudu/api/greeter-api";
import { EventListener, TimerEvent } from "./pudu/events/event-listener";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [timer, setTimer] = useState("00:00");

  useEffect(() => {
    const eventListener = new EventListener();

    eventListener.connect();

    eventListener.on<TimerEvent>("timer:tick", (event) => {
      setTimer(event.elapsedTime);
    });

    return () => {
      eventListener.disconnect();
    };
  }, []);

  async function greet() {
    try {
      const api = new GreeterApi();
      const result = await api.greet({ name });

      if (result.success && result.data) {
        setGreetMsg(result.data);
      } else {
        setGreetMsg(`Error: ${result.error}`);
      }
    } catch (error) {
      setGreetMsg(`Error: ${error}`);
    }
  }

  return (
    <main className="container">
      <div
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          fontSize: "1.5rem",
          fontWeight: "bold",
          fontFamily: "monospace",
          background: "rgba(0, 0, 0, 0.5)",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
        }}
      >
        {timer}
      </div>

      <h1>Welcome to Tauri + React + .NET Sidecar</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
          value={name}
        />
        <button type="submit">Greet (.NET)</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
