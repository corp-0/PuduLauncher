import { Box } from "@mui/joy";
import SideBar from "../organisms/sideBar/SideBar";
import { Outlet } from "react-router";
import { SideBarContextProvider } from "../../contextProviders/SideBarContextProvider";

export default function SideBarLayout() {

    return (
        <Box sx={{ display: 'flex', height: '100dvh', width: '100%', flexDirection: "row" }}>
            <SideBarContextProvider>
                <SideBar />
            </SideBarContextProvider>
            <Box sx={{
                flex: 1,
                bgcolor: "background.surface",
                height: "100dvh",
                overflow: "hidden",
                minWidth: 0
            }}>
                <Outlet />
            </Box>
        </Box>
    )
}
