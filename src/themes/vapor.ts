import { extendTheme } from "@mui/joy/styles";
import { CSSProperties } from "react";

// Exact Steam CSS custom properties
// System greys
const GP_SYSTEM_LIGHTEST_GREY = "#DCDEDF";
const GP_SYSTEM_LIGHTER_GREY = "#B8BCBF";
const GP_SYSTEM_LIGHT_GREY = "#8B929A";
const GP_SYSTEM_DARK_GREY = "#3D4450";
const GP_SYSTEM_DARKER_GREY = "#23262E";
const GP_SYSTEM_DARKEST_GREY = "#0E141B";

// Store blue greys
const GP_STORE_LIGHTEST_GREY = "#CCD8E3";
const GP_STORE_LIGHT_GREY = "#7C8EA3";
const GP_STORE_GREY = "#4e697d";
const GP_STORE_DARK_GREY = "#2A475E";
const GP_STORE_DARKER_GREY = "#1B2838";

// Colors
const GP_BLUE = "#1A9FFF";
const GP_BLUE_HI = "#00BBFF";
const GP_CHALKY_BLUE = "#66C0F4";
const GP_LIGHT_BLUE = "#B3DFFF";
const GP_DUSTY_BLUE = "#417a9b";
const GP_RED = "#D94126";
const GP_RED_HI = "#EE563B";
const GP_YELLOW = "#FFC82C";

// Steam client 5-value palette
const STEAM_DARKEST = "#171a21";
const STEAM_DARK = "#232730";
const STEAM_MID = "#292e37";
const STEAM_TEXT_GREY = "#adadad";

const vaporTheme = extendTheme({
    colorSchemes: {
        dark: {
            palette: {
                primary: {
                    50: GP_LIGHT_BLUE,
                    100: "#8ad4ff",
                    200: GP_CHALKY_BLUE,
                    300: "#4cb3ff",
                    400: GP_BLUE,
                    500: GP_DUSTY_BLUE,
                    600: "#2d6585",
                    700: "#1e4a64",
                    800: "#133245",
                    900: "#0a1c28",
                    solidBg: GP_BLUE,
                    solidColor: GP_SYSTEM_DARKEST_GREY,
                    solidHoverBg: GP_BLUE_HI,
                    solidActiveBg: GP_LIGHT_BLUE,
                    softBg: "rgba(26, 159, 255, 0.12)",
                    softColor: GP_BLUE,
                    softHoverBg: "rgba(26, 159, 255, 0.22)",
                    softActiveBg: "rgba(26, 159, 255, 0.32)",
                    outlinedBorder: GP_DUSTY_BLUE,
                    outlinedColor: GP_CHALKY_BLUE,
                    outlinedHoverBg: "rgba(102, 192, 244, 0.10)",
                    outlinedActiveBg: "rgba(102, 192, 244, 0.18)",
                    plainColor: GP_CHALKY_BLUE,
                    plainHoverBg: "rgba(102, 192, 244, 0.10)",
                    plainActiveBg: "rgba(102, 192, 244, 0.18)",
                },
                neutral: {
                    50: GP_SYSTEM_LIGHTEST_GREY,
                    100: GP_SYSTEM_LIGHTER_GREY,
                    200: GP_STORE_LIGHTEST_GREY,
                    300: GP_SYSTEM_LIGHT_GREY,
                    400: GP_STORE_LIGHT_GREY,
                    500: GP_STORE_GREY,
                    600: GP_SYSTEM_DARK_GREY,
                    700: GP_STORE_DARK_GREY,
                    800: GP_SYSTEM_DARKER_GREY,
                    900: GP_SYSTEM_DARKEST_GREY,
                    softBg: "rgba(143, 152, 160, 0.12)",
                    softColor: GP_SYSTEM_LIGHTEST_GREY,
                    softHoverBg: "rgba(143, 152, 160, 0.22)",
                    softActiveBg: "rgba(143, 152, 160, 0.32)",
                    plainColor: GP_SYSTEM_LIGHTER_GREY,
                    plainHoverBg: "rgba(143, 152, 160, 0.10)",
                    plainActiveBg: "rgba(143, 152, 160, 0.18)",
                    outlinedBorder: GP_SYSTEM_DARK_GREY,
                    outlinedColor: GP_SYSTEM_LIGHTER_GREY,
                    outlinedHoverBg: "rgba(143, 152, 160, 0.08)",
                    outlinedActiveBg: "rgba(143, 152, 160, 0.16)",
                },
                success: {
                    50: "#f2fad6",
                    100: "#e0f3a5",
                    200: "#c1e56e",
                    300: "#a4d007",
                    400: "#90ba3c",
                    500: "#6c9018",
                    600: "#5c7e10",
                    700: "#4a6510",
                    800: "#394e0e",
                    900: "#29380b",
                    solidBg: "#5c7e10",
                    solidColor: "#ffffff",
                    solidHoverBg: "#7ea64b",
                    solidActiveBg: "#90ba3c",
                },
                warning: {
                    50: "#fff8e0",
                    100: "#ffecb3",
                    200: "#ffdf80",
                    300: "#ffd24d",
                    400: GP_YELLOW,
                    500: "#d4a617",
                    600: "#a88312",
                    700: "#7d620e",
                    800: "#54420a",
                    900: "#2c2306",
                    solidBg: GP_YELLOW,
                    solidColor: GP_SYSTEM_DARKEST_GREY,
                },
                danger: {
                    50: "#fde8e5",
                    100: "#f9c6c0",
                    200: "#f39d94",
                    300: GP_RED_HI,
                    400: GP_RED,
                    500: "#b53520",
                    600: "#922b1a",
                    700: "#702114",
                    800: "#4f170e",
                    900: "#310e09",
                    solidBg: GP_RED,
                    solidColor: "#ffffff",
                    solidHoverBg: GP_RED_HI,
                    solidActiveBg: "#f39d94",
                },
                background: {
                    body: STEAM_DARKEST,
                    surface: STEAM_DARK,
                    popup: STEAM_MID,
                    level1: STEAM_MID,
                    level2: GP_SYSTEM_DARK_GREY,
                    level3: GP_STORE_DARK_GREY,
                    tooltip: STEAM_MID,
                },
                text: {
                    primary: GP_SYSTEM_LIGHTEST_GREY,
                    secondary: STEAM_TEXT_GREY,
                    tertiary: GP_SYSTEM_LIGHT_GREY,
                    icon: STEAM_TEXT_GREY,
                },
                divider: "rgba(102, 192, 244, 0.12)",
                focusVisible: GP_BLUE,
            },
        },
    },
    fontFamily: {
        body: '"Motiva Sans", Arial, Sans-serif',
        display: '"Motiva Sans", Arial, Sans-serif',
        code: '"Consolas", "Courier New", monospace',
    },
    radius: {
        xs: "1px",
        sm: "2px",
        md: "2px",
        lg: "3px",
        xl: "3px",
    },
    shadow: {
        xs: "0px 2px 2px 0px rgba(0,0,0,0.24)",
        sm: "0px 3px 6px 0px rgba(0,0,0,0.24)",
        md: "0px 3px 6px 0px rgba(0,0,0,0.24)",
        lg: "0px 12px 16px 0px rgba(0,0,0,0.24)",
        xl: "0px 24px 32px 0px rgba(0,0,0,0.24)",
    },
    components: {
        JoyButton: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    fontWeight: 400,
                    textTransform: "none" as const,
                    letterSpacing: "0.02em",
                    transition: "all 0.15s ease",
                    ...(ownerState.variant === "solid" && (ownerState.color === "primary" || ownerState.color === "warning") && {
                        background: `linear-gradient(to left, ${GP_DUSTY_BLUE} 5%, ${GP_CHALKY_BLUE} 95%)`,
                        color: "#ffffff",
                        "&:hover": {
                            background: `linear-gradient(to left, #4b9ac4 5%, #7ecef7 95%)`,
                            color: "#ffffff",
                        },
                    }),
                }),
            },
        },
        JoyCard: {
            styleOverrides: {
                root: {
                    backgroundColor: GP_STORE_DARKER_GREY,
                    border: `1px solid ${GP_SYSTEM_DARK_GREY}`,
                },
            },
        },
        JoySheet: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    ...(ownerState.variant === "outlined" && {
                        borderColor: GP_SYSTEM_DARK_GREY,
                    }),
                    ...(ownerState.variant === "soft" && {
                        backgroundColor: GP_SYSTEM_DARKER_GREY,
                    }),
                }),
            },
        },
        JoyInput: {
            styleOverrides: {
                root: {
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    border: `1px solid ${GP_SYSTEM_DARKEST_GREY}`,
                    boxShadow: `1px 1px 0 0 rgba(91, 132, 181, 0.2)`,
                    color: "#BFBFBF",
                    "&:focus-within": {
                        borderColor: GP_DUSTY_BLUE,
                    },
                    "&::before": { display: "none" },
                },
            },
        },
        JoySelect: {
            styleOverrides: {
                root: {
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    border: `1px solid ${GP_SYSTEM_DARKEST_GREY}`,
                    color: "#BFBFBF",
                    "&::before": { display: "none" },
                },
                listbox: {
                    backgroundColor: GP_SYSTEM_DARK_GREY,
                    border: "none",
                },
            },
        },
        JoyLink: {
            styleOverrides: {
                root: {
                    color: GP_CHALKY_BLUE,
                    "&:hover": {
                        color: "#ffffff",
                    },
                },
            },
        },
        JoyTab: {
            styleOverrides: {
                root: {
                    textTransform: "uppercase" as const,
                    fontSize: "12px",
                    fontWeight: 500,
                    color: GP_SYSTEM_LIGHTEST_GREY,
                    "&.Mui-selected": {
                        color: "#ffffff",
                    },
                    "&:hover": {
                        color: "#ffffff",
                    },
                },
            },
        },
        JoyListItemButton: {
            styleOverrides: {
                root: {
                    color: GP_SYSTEM_LIGHTEST_GREY,
                    "&:hover": {
                        backgroundColor: GP_SYSTEM_DARK_GREY,
                        color: "#ffffff",
                    },
                    "&.Mui-selected": {
                        backgroundColor: GP_SYSTEM_DARK_GREY,
                        color: "#ffffff",
                    },
                },
            },
        },
        JoyChip: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    ...(ownerState.variant === "solid" && {
                        background: `linear-gradient(to bottom, ${GP_DUSTY_BLUE} 5%, ${GP_CHALKY_BLUE} 95%)`,
                        color: "#ffffff",
                    }),
                }),
            },
        },
        JoyTooltip: {
            styleOverrides: {
                root: {
                    backgroundColor: "#c2c2c2",
                    color: "#3d3d3f",
                    boxShadow: "0 0 3px #000000",
                    fontSize: "11px",
                    borderRadius: "2px",
                },
            },
        },
        JoyModalDialog: {
            styleOverrides: {
                root: {
                    background: `radial-gradient(circle at top left, rgba(74, 81, 92, 0.4) 0%, rgba(75, 81, 92, 0) 60%), #25282e`,
                    color: "#acb2b8",
                    border: "none",
                },
            },
        },
        JoySnackbar: {
            styleOverrides: {
                root: {
                    backgroundColor: GP_SYSTEM_DARK_GREY,
                    border: "none",
                },
            },
        },
    },
});

export const vaporScrollbarStyles: Record<string, CSSProperties> = {
    "*": { scrollbarWidth: "thin", scrollbarColor: `${GP_SYSTEM_DARK_GREY} ${STEAM_DARK}` },
    "*::-webkit-scrollbar": { width: "10px", height: "10px" },
    "*::-webkit-scrollbar-track": { background: STEAM_DARK },
    "*::-webkit-scrollbar-thumb": {
        backgroundColor: GP_SYSTEM_DARK_GREY,
        border: `2px solid ${STEAM_DARK}`,
        borderRadius: "2px",
    },
    "*::-webkit-scrollbar-thumb:hover": { backgroundColor: GP_STORE_GREY },
};

export default vaporTheme;
