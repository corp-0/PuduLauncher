import {extendTheme} from "@mui/joy/styles";
import {CSSProperties} from "react";

const australNight = extendTheme({
    colorSchemes: {
        dark: {
            palette: {
                primary: {
                    50: "#e5fbf3",
                    100: "#c2f3df",
                    200: "#98e9c7",
                    300: "#69d9ac",
                    400: "#3bc792",
                    500: "#1fab78",
                    600: "#188c61",
                    700: "#126f4c",
                    800: "#0d543a",
                    900: "#083b29",
                },
                neutral: {
                    50: "#e9f1ec",
                    100: "#d2e2d8",
                    200: "#afc8ba",
                    300: "#89ac99",
                    400: "#678f7a",
                    500: "#4f7662",
                    600: "#3f5f4f",
                    700: "#31493d",
                    800: "#24352d",
                    900: "#18231d",
                },
                success: {
                    50: "#e4fbe8",
                    100: "#c4f2cd",
                    200: "#9de8ae",
                    300: "#70da8b",
                    400: "#48ca6e",
                    500: "#2aad55",
                    600: "#208f46",
                    700: "#1a7139",
                    800: "#14582d",
                    900: "#0f3f21",
                },
                warning: {
                    50: "#fff5de",
                    100: "#ffe8b7",
                    200: "#ffd98a",
                    300: "#ffc85a",
                    400: "#f2b331",
                    500: "#d79a16",
                    600: "#b17f11",
                    700: "#8d640f",
                    800: "#694a0d",
                    900: "#483209",
                },
                danger: {
                    50: "#ffe9ea",
                    100: "#ffcfd2",
                    200: "#f8a6ac",
                    300: "#ee7c86",
                    400: "#df5563",
                    500: "#c4384a",
                    600: "#a22d3d",
                    700: "#822532",
                    800: "#631d27",
                    900: "#47151c",
                },
                background: {
                    body: "#08120d",
                    surface: "#0e1b14",
                    popup: "#122319",
                    level1: "#152c1f",
                    level2: "#183424",
                    level3: "#1d3d2a",
                    tooltip: "#1d3d2a",
                },
                text: {
                    primary: "#eaf7ed",
                    secondary: "#afc8ba",
                    tertiary: "#89ac99",
                    icon: "#afc8ba",
                },
                divider: "rgba(105, 217, 172, 0.18)",
                focusVisible: "#69d9ac",
            },
        },
    },
});

export const australNightScrollbarStyles: Record<string, CSSProperties> = {
    "*": {scrollbarWidth: "thin", scrollbarColor: "#1fab78 #0e1b14"},
    "*::-webkit-scrollbar": {width: "12px", height: "12px"},
    "*::-webkit-scrollbar-track": {background: "#0e1b14"},
    "*::-webkit-scrollbar-thumb": {backgroundColor: "#1fab78", border: "2px solid #0e1b14", borderRadius: "8px"},
    "*::-webkit-scrollbar-thumb:hover": {backgroundColor: "#3bc792"},
};

export default australNight;
