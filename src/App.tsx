import "@fontsource/inter";
import { BrowserRouter, Route, Routes } from "react-router";
import { CssBaseline, CssVarsProvider, GlobalStyles } from "@mui/joy";
import SideBarLayout from "./components/layouts/SideBarLayout";
import ServersPage from "./components/pages/ServersPage";
import WorkInProgressLayout from "./components/layouts/workInProgressLayout/WorkInProgressLayout";
import { useThemeContext } from "./contextProviders/ThemeProvider";
import { themeRegistry, themeScrollbarRegistry } from "./themes";
import ComponentsDemoPage from "./components/pages/ComponentsDemoPage.tsx";
import { ServersContextProvider } from "./contextProviders/ServersContextProvider";
import { ErrorContextProvider } from "./contextProviders/ErrorContextProvider";
import InstallationsPage from "./components/pages/InstallationsPage.tsx";
import PreferencesPage from "./components/pages/PreferencesPage.tsx";
import { OnboardingContextProvider } from "./contextProviders/OnboardingContextProvider";
import { TtsInstallerContextProvider } from "./contextProviders/TtsInstallerContextProvider";

function App() {
    const { themeId } = useThemeContext();

    return (
        <CssVarsProvider defaultMode="dark" modeStorageKey="pudu-color-mode" theme={themeRegistry[themeId]}>
            <CssBaseline />
            <GlobalStyles styles={themeScrollbarRegistry[themeId]} />
            <BrowserRouter>
                <ErrorContextProvider>
                    <ServersContextProvider>
                        <TtsInstallerContextProvider>
                            <OnboardingContextProvider>
                                <Routes>
                                    <Route element={<SideBarLayout />}>
                                        <Route path="/" element={<ServersPage />} />
                                        <Route path="/installations" element={<InstallationsPage />} />
                                        <Route path="/preferences" element={<PreferencesPage />} />
                                        <Route path="/components" element={<ComponentsDemoPage />} />
                                        <Route path="*" element={<WorkInProgressLayout />} />
                                    </Route>
                                </Routes>
                            </OnboardingContextProvider>
                        </TtsInstallerContextProvider>
                    </ServersContextProvider>
                </ErrorContextProvider>
            </BrowserRouter>
        </CssVarsProvider>
    );
}

export default App;
