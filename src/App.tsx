
import { puduTheme, unitystationClassicTheme } from "./themes";
import "@fontsource/inter";
import { BrowserRouter, Route, Routes } from "react-router";
import { CssBaseline, CssVarsProvider } from "@mui/joy";
import ThemeDemoPage from "./components/pages/ThemeDemoPage";

function App() {
  return (
    <CssVarsProvider defaultMode="dark" modeStorageKey="pudu-color-mode" theme={unitystationClassicTheme}>
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
