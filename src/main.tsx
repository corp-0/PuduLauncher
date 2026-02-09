import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./contextProviders/ThemeProvider";
import { BackendConnectionChecker } from "./contextProviders/BackendConnectionChecker";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BackendConnectionChecker>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BackendConnectionChecker>
  </React.StrictMode>,
);
