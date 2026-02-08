
import puduTheme from "./theme";
import "./App.css";
import "@fontsource/inter";
import { BrowserRouter, Route, Routes } from "react-router";
import { CssBaseline, CssVarsProvider } from "@mui/joy";
import ThemeDemoPage from "./components/pages/ThemeDemoPage";

function App() {
  return (
    <CssVarsProvider defaultMode="dark" modeStorageKey="pudu-color-mode" theme={puduTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ThemeDemoPage />} />
        </Routes>
      </BrowserRouter>
    </CssVarsProvider>
  );
}

export default App;
