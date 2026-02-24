import { extendTheme } from "@mui/joy/styles";
import { CSSProperties } from "react";

const puduTheme = extendTheme({
    colorSchemes: {
        dark: {
            palette: {
                // Warm reddish-brown the pudu's signature fur color
                primary: {
                    50: "#fdf5f0",
                    100: "#fae7da",
                    200: "#f4ccb0",
                    300: "#ecac82",
                    400: "#e08c56",
                    500: "#d17236",
                    600: "#b55c28",
                    700: "#934822",
                    800: "#72381d",
                    900: "#542a17",
                },
                // Warm taupe cozy dark-mode neutrals
                neutral: {
                    50: "#f8f5f2",
                    100: "#f0eae4",
                    200: "#ddd4cb",
                    300: "#c5b8ab",
                    400: "#a99a8a",
                    500: "#8d7d6d",
                    600: "#716356",
                    700: "#574c41",
                    800: "#3d342c",
                    900: "#261f1a",
                },
                // Muted rosewood warm, not aggressive
                danger: {
                    50: "#fdf2f2",
                    100: "#fbe2e2",
                    200: "#f5c1c1",
                    300: "#ed9999",
                    400: "#e27070",
                    500: "#d14d4d",
                    600: "#b5383a",
                    700: "#932c2e",
                    800: "#722226",
                    900: "#541a1e",
                },
                // Forest moss green where pudus roam
                success: {
                    50: "#f1f8f0",
                    100: "#def0db",
                    200: "#b9deb3",
                    300: "#8ec886",
                    400: "#65ae5b",
                    500: "#479340",
                    600: "#367a31",
                    700: "#2a6026",
                    800: "#21491d",
                    900: "#193517",
                },
                // Golden honey amber autumn forest floor
                warning: {
                    50: "#fefaf0",
                    100: "#fdf2d6",
                    200: "#fae2a4",
                    300: "#f6ce6c",
                    400: "#f0b73a",
                    500: "#e5a01a",
                    600: "#c78814",
                    700: "#a36e10",
                    800: "#7e560d",
                    900: "#5d400a",
                },
                background: {
                    body: "#1a1613",
                    surface: "#241e1a",
                    popup: "#2d2620",
                    level1: "#352d27",
                    level2: "#3e352e",
                    level3: "#483f38",
                    tooltip: "#483f38",
                },
                text: {
                    primary: "#f0eae4",
                    secondary: "#c5b8ab",
                    tertiary: "#8d7d6d",
                    icon: "#a99a8a",
                },
                divider: "rgba(197, 184, 171, 0.16)",
                focusVisible: "#e08c56",
            },
        },
    },
});

export const puduScrollbarStyles: Record<string, CSSProperties> = {
    "*": { scrollbarWidth: "thin", scrollbarColor: "#8d7d6d #241e1a" },
    "*::-webkit-scrollbar": { width: "12px", height: "12px" },
    "*::-webkit-scrollbar-track": { background: "#241e1a" },
    "*::-webkit-scrollbar-thumb": { backgroundColor: "#8d7d6d", border: "2px solid #241e1a", borderRadius: "8px" },
    "*::-webkit-scrollbar-thumb:hover": { backgroundColor: "#a99a8a" },
};

export default puduTheme;
