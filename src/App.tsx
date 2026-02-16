import "@fontsource/inter";
import { BrowserRouter, Route, Routes } from "react-router";
import { CssBaseline, CssVarsProvider } from "@mui/joy";
import SideBarLayout from "./components/layouts/SideBarLayout";
import ServersPage from "./components/pages/ServersPage";
import WorkInProgressLayout from "./components/layouts/workInProgressLayout/WorkInProgressLayout";
import { useThemeContext } from "./contextProviders/ThemeProvider";
import { themeRegistry } from "./themes";
import ComponentsDemoPage from "./components/pages/ComponentsDemoPage.tsx";
import { ServersContextProvider } from "./contextProviders/ServersContextProvider";
import { ErrorContextProvider } from "./contextProviders/ErrorContextProvider";
import InstallationsPage from "./components/pages/InstallationsPage.tsx";
import PreferencesPage from "./components/pages/PreferencesPage.tsx";


function App() {
    const { themeId } = useThemeContext();

    return (
        <CssVarsProvider defaultMode="dark" modeStorageKey="pudu-color-mode" theme={themeRegistry[themeId]}>
            <CssBaseline />
            <BrowserRouter>
                <ErrorContextProvider>
                    <ServersContextProvider>
                        <Routes>
                            <Route element={<SideBarLayout />}>
                                <Route path="/" element={<ServersPage />} />
                                <Route path="/installations" element={<InstallationsPage />} />
                                <Route path="/preferences" element={<PreferencesPage />} />
                                <Route path="/components" element={<ComponentsDemoPage />} />
                                <Route path="*" element={<WorkInProgressLayout />} />
                            </Route>
                        </Routes>
                    </ServersContextProvider>
                </ErrorContextProvider>
            </BrowserRouter>
        </CssVarsProvider>
    );
}

export default App;
