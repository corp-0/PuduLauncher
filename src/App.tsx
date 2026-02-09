// import { puduTheme } from "./themes";
import "@fontsource/inter";
import {BrowserRouter, Route, Routes} from "react-router";
import {CssBaseline, CssVarsProvider} from "@mui/joy";
import SideBarLayout from "./components/layouts/SideBarLayout";
import ServersPage from "./components/pages/ServersPage";
import {BackendConnectionChecker} from "./contextProviders/BackendConnectionChecker";
import WorkInProgressLayout from "./components/layouts/WorkInProgressLayout/WorkInProgressLayout";
import {unitystationClassicTheme} from "./themes";

function App() {
    return (
        <CssVarsProvider defaultMode="dark" modeStorageKey="pudu-color-mode" theme={unitystationClassicTheme}>
            <CssBaseline/>
            <BackendConnectionChecker>
                <BrowserRouter>
                    <Routes>
                        <Route element={<SideBarLayout/>}>
                            <Route path="/" element={<ServersPage/>}/>
                            <Route path="*" element={<WorkInProgressLayout/>}/>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </BackendConnectionChecker>
        </CssVarsProvider>
    );
}

export default App;
