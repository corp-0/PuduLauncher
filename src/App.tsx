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
import { IpcContextProvider } from "./contextProviders/IpcContextProvider";
import IpcPermissionPage from "./components/pages/IpcPermissionPage.tsx";
import NewsPage from "./components/pages/NewsPage.tsx";

function App() {
    const { themeId } = useThemeContext();

    return (
        <BrowserRouter>
            <Routes>
                {/* Standalone popup window own theme provider, no sidebar */}
                <Route path="/ipc-permission" element={<IpcPermissionPage />} />

                {/* Main launcher window */}
                <Route path="/*" element={
                    <CssVarsProvider defaultMode="dark" modeStorageKey="pudu-color-mode" theme={themeRegistry[themeId]}>
                        <CssBaseline />
                        <GlobalStyles styles={themeScrollbarRegistry[themeId]} />
                        <ErrorContextProvider>
                            <IpcContextProvider>
                                <ServersContextProvider>
                                    <TtsInstallerContextProvider>
                                        <OnboardingContextProvider>
                                            <Routes>
                                                <Route element={<SideBarLayout />}>
                                                    <Route path="/" element={<ServersPage />} />
                                                    <Route path="/installations" element={<InstallationsPage />} />
                                                    <Route path="/news" element={<NewsPage />} />
                                                    <Route path="/preferences" element={<PreferencesPage />} />
                                                    <Route path="/components" element={<ComponentsDemoPage />} />
                                                    <Route path="*" element={<WorkInProgressLayout />} />
                                                </Route>
                                            </Routes>
                                        </OnboardingContextProvider>
                                    </TtsInstallerContextProvider>
                                </ServersContextProvider>
                            </IpcContextProvider>
                        </ErrorContextProvider>
                    </CssVarsProvider>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
