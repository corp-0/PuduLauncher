import React from "react";
import ReactDOM from "react-dom/client";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

// Dev tools window gets its own minimal render tree, no ThemeProvider, no App.
// This avoids touching App.tsx which would break React Compiler's JSX memoization.
if (import.meta.env.DEV && window.location.pathname === "/devtools") {
  import("./devtools/DevToolsPage").then(({ default: DevToolsPage }) => {
    root.render(
      <React.StrictMode>
        <DevToolsPage />
      </React.StrictMode>,
    );
  });
} else {
  // Normal app, static imports keep App.tsx identical to its original form
  const { ThemeProvider } = await import("./contextProviders/ThemeProvider");
  const { default: App } = await import("./App");

  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>,
  );

  // Ctrl+Shift+D opens devtools window (dev only, outside React tree)
  if (import.meta.env.DEV) {
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        void import("./devtools/open-devtools-window").then((m) => m.openDevToolsWindow());
      }
    });
  }
}
