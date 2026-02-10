import "@fontsource/inter";
import {BrowserRouter, Route, Routes} from "react-router";
import {CssBaseline, CssVarsProvider} from "@mui/joy";
import SideBarLayout from "./components/layouts/SideBarLayout";
import ServersPage from "./components/pages/ServersPage";
import WorkInProgressLayout from "./components/layouts/workInProgressLayout/WorkInProgressLayout";
import {useThemeContext} from "./contextProviders/ThemeProvider";
import {themeRegistry} from "./themes";
import ComponentsDemoPage from "./components/pages/ComponentsDemoPage.tsx";

function App() {
    const {themeId} = useThemeContext();

    return (
        <CssVarsProvider defaultMode="dark" modeStorageKey="pudu-color-mode" theme={themeRegistry[themeId]}>
            <CssBaseline/>
            <BrowserRouter>
                <Routes>
                    <Route element={<SideBarLayout/>}>
                        <Route path="/" element={<ServersPage/>}/>
                        <Route path="/components" element={<ComponentsDemoPage/>}/>
                        <Route path="*" element={<WorkInProgressLayout/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </CssVarsProvider>
    );
}

export default App;
