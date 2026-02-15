import {
    Code,
    Favorite,
    Message,
    Newspaper,
    Public,
    Save,
    Settings,
    VideogameAsset
} from "@mui/icons-material";
import {openUrl} from "@tauri-apps/plugin-opener";
import {
    createContext,
    type PropsWithChildren,
    useContext
} from "react";
import {useMatch, useNavigate} from "react-router";
import {SideBarMenuItemProps} from "../components/molecules/sideBar/SideBarMenuItem";
import {SideBarExternalLinkProps} from "../components/molecules/sideBar/SideBarExternalLink";

interface SideBarContextValue {
    menuItems: SideBarMenuItemProps[];
    externalLinks: SideBarExternalLinkProps[];
}

const SideBarContext = createContext<SideBarContextValue | undefined>(undefined);

export function SideBarContextProvider(props: PropsWithChildren) {
    const {children} = props;
    const navigate = useNavigate();

    const isServersActive = useMatch({path: "/", end: true}) !== null;
    const isNewsActive = useMatch({path: "/news/*", end: false}) !== null;
    const isInstallationsActive = useMatch({path: "/installations/*", end: false}) !== null;
    const isPreferencesActive = useMatch({path: "/preferences/*", end: false}) !== null;
    const isComponentsActive = useMatch({path: "/components/*", end: false}) !== null;

    const menuItems: SideBarMenuItemProps[] = [
        {
            text: "Servers",
            icon: <VideogameAsset/>,
            isActive: isServersActive,
            onClick: () => navigate("/"),
        },
        {
            text: "News",
            icon: <Newspaper/>,
            isActive: isNewsActive,
            onClick: () => navigate("/news"),
        },
        {
            text: "Installations",
            icon: <Save/>,
            isActive: isInstallationsActive,
            onClick: () => navigate("/installations"),
        },
        {
            text: "Preferences",
            icon: <Settings/>,
            isActive: isPreferencesActive,
            onClick: () => navigate("/preferences"),
        },
        {
            text: "Components Demo",
            icon: <Code/>,
            isActive: isComponentsActive,
            onClick: () => navigate("/components"),
        },
    ];

    const externalLinks: SideBarExternalLinkProps[] = [
        {
            tooltip: "Unitystation's website",
            icon: <Public/>,
            onClick: () => {
                void openUrl("https://unitystation.org/");
            },
        },
        {
            tooltip: "Unitystation's Patreon",
            icon: <Favorite/>,
            onClick: () => {
                void openUrl("https://patreon.com/unitystation/");
            },
        },
        {
            tooltip: "Unitystation's Discord",
            icon: <Message/>,
            onClick: () => {
                void openUrl("https://discord.com/invite/tFcTpBp");
            },
        },
    ];

    const value: SideBarContextValue = {
        menuItems,
        externalLinks,
    };

    return (
        <SideBarContext.Provider value={value}>
            {children}
        </SideBarContext.Provider>
    );
}

export function useSideBarContext() {
    const context = useContext(SideBarContext);

    if (context === undefined) {
        throw new Error("useSideBarContext must be used within a SideBarContextProvider.");
    }

    return context;
}
