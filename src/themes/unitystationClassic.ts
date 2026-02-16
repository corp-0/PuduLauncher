import {extendTheme} from "@mui/joy/styles";
import {CSSProperties} from "react";

// Based on the Avalonia StationHub color palette:
// Primary accent: #0078a3 (teal/cyan)
// Blue scale: #132736 → #21435C → #1D3B50 → #38729C → #4FA1DB
// Backgrounds: #05131e to #19212c (dark navy)
// Error: #AA4444

const unitystationClassicTheme = extendTheme({
    colorSchemes: {
        dark: {
            palette: {
                // Teal/cyan accent — the StationHub signature color
                primary: {
                    50: "#e0f4fb",
                    100: "#b3e3f5",
                    200: "#80d0ee",
                    300: "#4dbde7",
                    400: "#26ade0",
                    500: "#0078a3",
                    600: "#00668b",
                    700: "#00516f",
                    800: "#003c53",
                    900: "#002738",
                },
                // Cool blue-gray — derived from the Primary1-5 scale
                neutral: {
                    50: "#e4eaf0",
                    100: "#c5d0dc",
                    200: "#9aacbf",
                    300: "#7089a2",
                    400: "#4f6d88",
                    500: "#38729c",
                    600: "#21435c",
                    700: "#1d3b50",
                    800: "#132736",
                    900: "#0a1a26",
                },
                // Muted red — from the #AA4444 error color
                danger: {
                    50: "#fdf2f2",
                    100: "#f9dede",
                    200: "#f0b8b8",
                    300: "#e48e8e",
                    400: "#d46666",
                    500: "#aa4444",
                    600: "#8e3636",
                    700: "#722b2b",
                    800: "#562020",
                    900: "#3d1616",
                },
                // Cool green — complementing the teal primary
                success: {
                    50: "#e6f5ec",
                    100: "#c3e8d1",
                    200: "#96d6af",
                    300: "#65c18a",
                    400: "#3eae6c",
                    500: "#1e9652",
                    600: "#187c44",
                    700: "#136236",
                    800: "#0e4a29",
                    900: "#0a331d",
                },
                // Amber/gold — warm accent for warnings
                warning: {
                    50: "#fef8eb",
                    100: "#fceccc",
                    200: "#f9d78f",
                    300: "#f5c04e",
                    400: "#e8a81c",
                    500: "#c98f12",
                    600: "#a67510",
                    700: "#835c0d",
                    800: "#63460a",
                    900: "#463208",
                },
                background: {
                    body: "#05131e",
                    surface: "#0d1c29",
                    popup: "#132736",
                    level1: "#19212c",
                    level2: "#1d3b50",
                    level3: "#21435c",
                    tooltip: "#21435c",
                },
                text: {
                    primary: "#fcfcfd",
                    secondary: "#c5d0dc",
                    tertiary: "#7089a2",
                    icon: "#9aacbf",
                },
                divider: "rgba(79, 161, 219, 0.14)",
                focusVisible: "#4FA1DB",
            },
        },
    },
    fontFamily: {
        body: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        display: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        code: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    },
});

export const unitystationClassicScrollbarStyles: Record<string, CSSProperties> = {
    "*": {scrollbarWidth: "thin", scrollbarColor: "#38729c #0d1c29"},
    "*::-webkit-scrollbar": {width: "12px", height: "12px"},
    "*::-webkit-scrollbar-track": {background: "#0d1c29"},
    "*::-webkit-scrollbar-thumb": {backgroundColor: "#38729c", border: "2px solid #0d1c29", borderRadius: "8px"},
    "*::-webkit-scrollbar-thumb:hover": {backgroundColor: "#4fa1db"},
};

export default unitystationClassicTheme;
