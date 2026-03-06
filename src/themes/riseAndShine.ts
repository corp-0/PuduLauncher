import { extendTheme } from "@mui/joy/styles";
import { CSSProperties } from "react";

// HL2-era Source Engine VGUI (2004)
// "Rise and shine, Mr. Freeman."
// White text, yellow accents, olive-green panels, uniform buttons

// Olive-green background tones (from the VGUI panel backgrounds)
const VGUI_DARKEST = "#1b1e14";       // Deepest: behind everything
const VGUI_DARKER = "#272b1e";        // Body background
const VGUI_DARK = "#333828";          // Surface / panels
const VGUI_MID = "#3e4430";           // Elevated surfaces, popups, cards
const VGUI_BORDER = "#4e5540";        // Panel borders, dividers
const VGUI_RAISED = "#565e48";        // Button face, raised elements

// Text: white primary, with yellow as the accent
const VGUI_WHITE = "#e8e8e0";         // Primary text (warm white)
const VGUI_GRAY = "#b0b0a4";          // Secondary text
const VGUI_DIM = "#787870";           // Tertiary / disabled text

// THE accent: VGUI yellow-gold (achievement titles, progress bars, highlights)
const VGUI_YELLOW = "#d4a838";        // Primary accent
const VGUI_YELLOW_HI = "#e8bc48";     // Hover / bright
const VGUI_YELLOW_LO = "#b08828";     // Pressed / muted
const VGUI_YELLOW_SOFT = "rgba(212, 168, 56, 0.12)";
const VGUI_YELLOW_SOFT_HI = "rgba(212, 168, 56, 0.22)";
const VGUI_YELLOW_SOFT_ACT = "rgba(212, 168, 56, 0.32)";

// Uniform button style: olive panel, no color variance
const buttonBase = {
    backgroundColor: VGUI_RAISED,
    color: VGUI_WHITE,
    border: `1px solid ${VGUI_BORDER}`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.3)`,
    fontWeight: 400 as const,
    textTransform: "none" as const,
    letterSpacing: "0.01em",
    justifyContent: "flex-start" as const,
    transition: "all 0.1s ease",
    "&:hover": {
        backgroundColor: "#626a52",
        color: "#ffffff",
    },
    "&:active": {
        backgroundColor: VGUI_MID,
        boxShadow: `inset 0 2px 3px rgba(0,0,0,0.3)`,
    },
};

// Status colors (muted, all share the same button appearance)
const VGUI_RED = "#c44430";
const VGUI_RED_HI = "#d85540";
const VGUI_GREEN = "#6c9028";
const VGUI_GREEN_HI = "#80a838";

const riseAndShineTheme = extendTheme({
    colorSchemes: {
        dark: {
            palette: {
                primary: {
                    50: "#fdf6da",
                    100: "#f8e8a0",
                    200: "#efd566",
                    300: VGUI_YELLOW_HI,
                    400: VGUI_YELLOW,
                    500: VGUI_YELLOW_LO,
                    600: "#8c6c1c",
                    700: "#685014",
                    800: "#44340e",
                    900: "#221a07",
                    solidBg: VGUI_YELLOW,
                    solidColor: VGUI_DARKEST,
                    solidHoverBg: VGUI_YELLOW_HI,
                    solidActiveBg: VGUI_YELLOW_LO,
                    softBg: VGUI_YELLOW_SOFT,
                    softColor: VGUI_YELLOW,
                    softHoverBg: VGUI_YELLOW_SOFT_HI,
                    softActiveBg: VGUI_YELLOW_SOFT_ACT,
                    outlinedBorder: VGUI_YELLOW_LO,
                    outlinedColor: VGUI_YELLOW,
                    outlinedHoverBg: "rgba(212, 168, 56, 0.10)",
                    outlinedActiveBg: "rgba(212, 168, 56, 0.18)",
                    plainColor: VGUI_YELLOW,
                    plainHoverBg: "rgba(212, 168, 56, 0.10)",
                    plainActiveBg: "rgba(212, 168, 56, 0.18)",
                },
                neutral: {
                    50: "#f0f0e8",
                    100: VGUI_WHITE,
                    200: VGUI_GRAY,
                    300: VGUI_DIM,
                    400: VGUI_RAISED,
                    500: VGUI_BORDER,
                    600: VGUI_MID,
                    700: VGUI_DARK,
                    800: VGUI_DARKER,
                    900: VGUI_DARKEST,
                    softBg: "rgba(176, 176, 164, 0.10)",
                    softColor: VGUI_WHITE,
                    softHoverBg: "rgba(176, 176, 164, 0.18)",
                    softActiveBg: "rgba(176, 176, 164, 0.26)",
                    plainColor: VGUI_GRAY,
                    plainHoverBg: "rgba(176, 176, 164, 0.10)",
                    plainActiveBg: "rgba(176, 176, 164, 0.18)",
                    outlinedBorder: VGUI_BORDER,
                    outlinedColor: VGUI_GRAY,
                    outlinedHoverBg: "rgba(176, 176, 164, 0.08)",
                    outlinedActiveBg: "rgba(176, 176, 164, 0.16)",
                },
                success: {
                    50: "#e8f0d0",
                    100: "#c8dca0",
                    200: "#a0c468",
                    300: VGUI_GREEN_HI,
                    400: VGUI_GREEN,
                    500: "#587420",
                    600: "#445a18",
                    700: "#344412",
                    800: "#24300c",
                    900: "#141c06",
                    solidBg: VGUI_RAISED,
                    solidColor: VGUI_WHITE,
                    solidHoverBg: "#626a52",
                    solidActiveBg: VGUI_MID,
                },
                warning: {
                    50: "#fdf6da",
                    100: "#f8e8a0",
                    200: "#efd566",
                    300: VGUI_YELLOW_HI,
                    400: VGUI_YELLOW,
                    500: VGUI_YELLOW_LO,
                    600: "#8c6c1c",
                    700: "#685014",
                    800: "#44340e",
                    900: "#221a07",
                    solidBg: VGUI_RAISED,
                    solidColor: VGUI_WHITE,
                    solidHoverBg: "#626a52",
                    solidActiveBg: VGUI_MID,
                },
                danger: {
                    50: "#fce8e4",
                    100: "#f5c4bc",
                    200: "#ec9a8e",
                    300: VGUI_RED_HI,
                    400: VGUI_RED,
                    500: "#a03828",
                    600: "#802c20",
                    700: "#602118",
                    800: "#401610",
                    900: "#200b08",
                    solidBg: VGUI_RAISED,
                    solidColor: VGUI_WHITE,
                    solidHoverBg: "#626a52",
                    solidActiveBg: VGUI_MID,
                },
                background: {
                    body: VGUI_DARKER,
                    surface: VGUI_DARK,
                    popup: VGUI_MID,
                    level1: VGUI_MID,
                    level2: VGUI_BORDER,
                    level3: VGUI_RAISED,
                    tooltip: VGUI_MID,
                },
                text: {
                    primary: VGUI_WHITE,
                    secondary: VGUI_GRAY,
                    tertiary: VGUI_DIM,
                    icon: VGUI_GRAY,
                },
                divider: VGUI_BORDER,
                focusVisible: VGUI_YELLOW,
            },
        },
    },
    fontFamily: {
        body: '"Verdana", "Tahoma", "Geneva", sans-serif',
        display: '"Verdana", "Tahoma", "Geneva", sans-serif',
        code: '"Lucida Console", "Courier New", monospace',
    },
    fontSize: {
        xs: "11px",
        sm: "12px",
        md: "13px",
        lg: "14px",
        xl: "16px",
        xl2: "18px",
        xl3: "22px",
        xl4: "28px",
    },
    radius: {
        xs: "1px",
        sm: "2px",
        md: "2px",
        lg: "3px",
        xl: "3px",
    },
    shadow: {
        xs: `0px 1px 2px 0px rgba(0,0,0,0.40)`,
        sm: `0px 2px 4px 0px rgba(0,0,0,0.40)`,
        md: `0px 3px 6px 0px rgba(0,0,0,0.40)`,
        lg: `0px 8px 16px 0px rgba(0,0,0,0.40)`,
        xl: `0px 16px 24px 0px rgba(0,0,0,0.40)`,
    },
    components: {
        JoyButton: {
            styleOverrides: {
                root: () => ({
                    ...buttonBase,
                }),
            },
        },
        JoyIconButton: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    ...(ownerState.variant === "solid" && {
                        ...buttonBase,
                    }),
                }),
            },
        },
        JoyCard: {
            styleOverrides: {
                root: {
                    backgroundColor: VGUI_MID,
                    border: `1px solid ${VGUI_BORDER}`,
                },
            },
        },
        JoySheet: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    ...(ownerState.variant === "outlined" && {
                        borderColor: VGUI_BORDER,
                    }),
                    ...(ownerState.variant === "soft" && {
                        backgroundColor: VGUI_DARKER,
                    }),
                }),
            },
        },
        JoyInput: {
            styleOverrides: {
                root: {
                    backgroundColor: VGUI_DARKEST,
                    border: `1px solid ${VGUI_BORDER}`,
                    boxShadow: `inset 0 1px 3px rgba(0,0,0,0.3)`,
                    color: VGUI_WHITE,
                    "&:focus-within": {
                        borderColor: VGUI_YELLOW,
                    },
                    "&::before": { display: "none" },
                },
            },
        },
        JoyTextarea: {
            styleOverrides: {
                root: {
                    backgroundColor: VGUI_DARKEST,
                    border: `1px solid ${VGUI_BORDER}`,
                    boxShadow: `inset 0 1px 3px rgba(0,0,0,0.3)`,
                    color: VGUI_WHITE,
                    "&:focus-within": {
                        borderColor: VGUI_YELLOW,
                    },
                    "&::before": { display: "none" },
                },
            },
        },
        JoySelect: {
            styleOverrides: {
                root: {
                    backgroundColor: VGUI_DARKEST,
                    border: `1px solid ${VGUI_BORDER}`,
                    color: VGUI_WHITE,
                    "&::before": { display: "none" },
                },
                listbox: {
                    backgroundColor: VGUI_DARK,
                    border: `1px solid ${VGUI_BORDER}`,
                },
            },
        },
        JoyLink: {
            styleOverrides: {
                root: {
                    color: VGUI_YELLOW,
                    "&:hover": {
                        color: VGUI_YELLOW_HI,
                    },
                },
            },
        },
        JoyTab: {
            styleOverrides: {
                root: {
                    fontSize: "12px",
                    fontWeight: 400,
                    color: VGUI_GRAY,
                    "&.Mui-selected": {
                        color: VGUI_YELLOW,
                    },
                    "&:hover": {
                        color: VGUI_WHITE,
                    },
                },
            },
        },
        JoyListItemButton: {
            styleOverrides: {
                root: {
                    color: VGUI_WHITE,
                    "&:hover": {
                        backgroundColor: VGUI_MID,
                        color: VGUI_YELLOW,
                    },
                    "&.Mui-selected": {
                        backgroundColor: VGUI_MID,
                        color: VGUI_YELLOW,
                    },
                },
            },
        },
        JoyChip: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    ...(ownerState.variant === "solid" && {
                        backgroundColor: VGUI_RAISED,
                        color: VGUI_WHITE,
                    }),
                }),
            },
        },
        JoyTooltip: {
            styleOverrides: {
                root: {
                    backgroundColor: VGUI_MID,
                    color: VGUI_WHITE,
                    border: `1px solid ${VGUI_BORDER}`,
                    boxShadow: `0 2px 8px rgba(0,0,0,0.5)`,
                    fontSize: "11px",
                    borderRadius: "2px",
                },
            },
        },
        JoyModalDialog: {
            styleOverrides: {
                root: {
                    background: VGUI_DARK,
                    color: VGUI_WHITE,
                    border: `1px solid ${VGUI_BORDER}`,
                    boxShadow: `0 4px 24px rgba(0,0,0,0.6)`,
                },
            },
        },
        JoySnackbar: {
            styleOverrides: {
                root: {
                    backgroundColor: VGUI_MID,
                    border: `1px solid ${VGUI_BORDER}`,
                },
            },
        },
        JoyDivider: {
            styleOverrides: {
                root: {
                    borderColor: VGUI_BORDER,
                },
            },
        },
        JoySwitch: {
            styleOverrides: {
                track: ({ ownerState }) => ({
                    backgroundColor: VGUI_DARKEST,
                    border: `1px solid ${VGUI_BORDER}`,
                    ...(ownerState.checked && {
                        backgroundColor: VGUI_YELLOW_LO,
                        borderColor: VGUI_YELLOW,
                    }),
                }),
                thumb: ({ ownerState }) => ({
                    backgroundColor: VGUI_RAISED,
                    ...(ownerState.checked && {
                        backgroundColor: VGUI_YELLOW,
                    }),
                }),
            },
        },
        JoyLinearProgress: {
            styleOverrides: {
                root: {
                    backgroundColor: VGUI_DARKEST,
                    border: `1px solid ${VGUI_BORDER}`,
                    borderRadius: "0px",
                    "&::before": {
                        borderRadius: "0px",
                        backgroundImage: `repeating-linear-gradient(
                            90deg,
                            currentColor 0px,
                            currentColor 8px,
                            transparent 8px,
                            transparent 16px
                        )`,
                        backgroundColor: "transparent",
                    },
                },
            },
        },
        JoyCircularProgress: {
            styleOverrides: {
                root: {
                    "--CircularProgress-trackColor": VGUI_DARK,
                },
            },
        },
        JoyCheckbox: {
            styleOverrides: {
                checkbox: ({ ownerState }) => ({
                    ...(ownerState.checked && {
                        backgroundColor: VGUI_DARKEST,
                        borderColor: VGUI_BORDER,
                        color: VGUI_YELLOW,
                    }),
                }),
            },
        },
    },
});

const SCROLL_TRACK = "#6b7058";       // Lighter muted olive (the background gutter)
const SCROLL_THUMB = "#4a5038";       // Darker olive (the draggable part)
const SCROLL_THUMB_HI = "#565c46";    // Thumb on hover

export const riseAndShineScrollbarStyles: Record<string, CSSProperties> = {
    "*": { scrollbarWidth: "auto", scrollbarColor: `${SCROLL_THUMB} ${SCROLL_TRACK}` },
    "*::-webkit-scrollbar": { width: "18px", height: "18px" },
    "*::-webkit-scrollbar-track": {
        background: SCROLL_TRACK,
        borderLeft: "1px solid #3e4432",
        borderRight: "1px solid #3e4432",
    },
    "*::-webkit-scrollbar-thumb": {
        backgroundColor: SCROLL_THUMB,
        borderRadius: "0px",
        boxShadow: `inset 1px 1px 0 ${SCROLL_THUMB_HI}, inset -1px -1px 0 #2e3424`,
    },
    "*::-webkit-scrollbar-thumb:hover": {
        backgroundColor: SCROLL_THUMB_HI,
        boxShadow: `inset 1px 1px 0 #646c50, inset -1px -1px 0 #2e3424`,
    },
};

export default riseAndShineTheme;
