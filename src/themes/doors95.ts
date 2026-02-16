import { extendTheme } from "@mui/joy/styles";

// DOORS 95 PALETTE
const WIN95_TEAL = "#008080";      // Desktop Background
const WIN95_GRAY = "#C0C0C0";      // Surface/Window Color
const WIN95_BLUE = "#000080";      // Title Bar / Primary
const WIN95_WHITE = "#FFFFFF";     // Highlights
const WIN95_BLACK = "#000000";     // Text / Deep Shadows
const WIN95_DKGRAY = "#808080";    // Shadow mid-tone

// CSS HELPER FOR THE "CHISELED" LOOK
const bevelUp = `
  inset 1px 1px ${WIN95_WHITE}, 
  inset -1px -1px ${WIN95_BLACK}, 
  inset 2px 2px ${WIN95_GRAY}, 
  inset -2px -2px ${WIN95_DKGRAY}
`;

const bevelDown = `
  inset 1px 1px ${WIN95_BLACK}, 
  inset -1px -1px ${WIN95_WHITE}, 
  inset 2px 2px ${WIN95_DKGRAY}, 
  inset -2px -2px ${WIN95_GRAY}
`;

const sunkenWell = `
  inset 1px 1px ${WIN95_DKGRAY}, 
  inset -1px -1px ${WIN95_WHITE}, 
  inset 2px 2px ${WIN95_BLACK}, 
  inset -2px -2px ${WIN95_GRAY}
`;

const doors95 = extendTheme({
    colorSchemes: {
        dark: {
            palette: {
                background: {
                    body: WIN95_TEAL,
                    surface: WIN95_GRAY,
                    level1: WIN95_GRAY,
                    level2: WIN95_GRAY,
                    level3: WIN95_GRAY,
                    tooltip: "#FFFFE1",
                    popup: WIN95_GRAY,
                },
                text: {
                    primary: WIN95_BLACK,
                    secondary: WIN95_BLACK,
                    tertiary: WIN95_WHITE,
                    icon: WIN95_BLACK,
                },
                primary: {
                    solidBg: WIN95_BLUE,
                    solidColor: WIN95_WHITE,
                    solidHoverBg: "#1010A0",
                    solidActiveBg: WIN95_BLUE,

                    outlinedColor: WIN95_BLUE,
                    outlinedBorder: WIN95_BLUE,
                    plainColor: WIN95_BLUE,

                    50: WIN95_BLUE,
                    100: WIN95_BLUE,
                    200: WIN95_BLUE,
                    300: WIN95_BLUE,
                    400: WIN95_BLUE,
                    500: WIN95_BLUE,
                    600: WIN95_BLUE,
                    700: WIN95_BLUE,
                    800: WIN95_BLUE,
                    900: WIN95_BLUE,
                },
                neutral: {
                    solidBg: WIN95_GRAY,
                    solidColor: WIN95_BLACK,
                    plainColor: WIN95_BLACK,
                    outlinedBorder: WIN95_DKGRAY,

                    50: WIN95_GRAY,
                    100: WIN95_GRAY,
                    200: WIN95_GRAY,
                    300: WIN95_GRAY,
                    400: WIN95_GRAY,
                    500: WIN95_GRAY,
                    600: WIN95_GRAY,
                    700: WIN95_GRAY,
                    800: WIN95_GRAY,
                    900: WIN95_GRAY,
                },
                danger: {
                    solidBg: "#FF0000",
                    solidColor: WIN95_WHITE,
                },
                divider: WIN95_DKGRAY,
                focusVisible: WIN95_BLACK,
            },
        },
    },
    fontFamily: {
        body: '"Tahoma", "MS Sans Serif", "Microsoft Sans Serif", "Segoe UI", sans-serif',
        display: '"Tahoma", "MS Sans Serif", "Microsoft Sans Serif", "Segoe UI", sans-serif',
        code: '"Lucida Console", "Courier New", monospace',
    },
    radius: {
        xs: "0px",
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
    },
    shadow: {
        xs: "none",
        sm: "none",
        md: "none",
        lg: "none",
        xl: "none",
    },
    components: {
        JoyButton: {
            styleOverrides: {
                root: {
                    backgroundColor: WIN95_GRAY,
                    color: WIN95_BLACK,
                    boxShadow: bevelUp,
                    border: "none",
                    padding: "4px 12px",
                    minHeight: "28px",
                    fontWeight: "normal",
                    "&:not(.Mui-disabled):hover": {
                        backgroundColor: WIN95_BLUE,
                        color: WIN95_WHITE,
                    },
                    "&:active": {
                        boxShadow: bevelDown,
                        transform: "translate(1px, 1px)",
                    },
                    "&.Mui-colorPrimary": {
                        backgroundColor: WIN95_GRAY,
                        color: WIN95_BLACK,
                        fontWeight: "bold",
                    },
                },
            },
        },
        JoyInput: {
            styleOverrides: {
                root: {
                    backgroundColor: WIN95_WHITE,
                    color: WIN95_BLACK,
                    border: "none",
                    boxShadow: sunkenWell,
                    borderRadius: 0,
                    "&::before": {
                        display: "none",
                    }
                },
            },
        },
        JoySelect: {
            styleOverrides: {
                root: {
                    backgroundColor: WIN95_WHITE,
                    color: WIN95_BLACK,
                    border: "none",
                    boxShadow: sunkenWell,
                    borderRadius: 0,
                    "&::before": {
                        display: "none",
                    },
                },
                indicator: {
                    color: WIN95_BLACK,
                },
                listbox: {
                    backgroundColor: WIN95_WHITE,
                    color: WIN95_BLACK,
                    border: `1px solid ${WIN95_DKGRAY}`,
                    "& .MuiOption-root": {
                        backgroundColor: `${WIN95_WHITE} !important`,
                        color: `${WIN95_BLACK} !important`,
                    },
                    "& .MuiOption-root:hover, & .MuiOption-root.MuiOption-highlighted": {
                        backgroundColor: `${WIN95_BLUE} !important`,
                        color: `${WIN95_WHITE} !important`,
                    },
                    "& .MuiOption-root[aria-selected='true']": {
                        backgroundColor: `${WIN95_BLUE} !important`,
                        color: `${WIN95_WHITE} !important`,
                    },
                },
            },
        },
        JoyOption: {
            styleOverrides: {
                root: {
                    color: WIN95_BLACK,
                    "&:hover": {
                        backgroundColor: WIN95_BLUE,
                        color: WIN95_WHITE,
                    },
                    "&[aria-selected='true']": {
                        backgroundColor: WIN95_BLUE,
                        color: WIN95_WHITE,
                    },
                    "&[aria-selected='true']:hover": {
                        backgroundColor: WIN95_BLUE,
                        color: WIN95_WHITE,
                    },
                },
            },
        },
        JoyListItemButton: {
            styleOverrides: {
                root: {
                    "&:not(.Mui-selected)": {
                        color: WIN95_WHITE,
                    },
                    "&:not(.Mui-selected) .MuiTypography-root": {
                        color: WIN95_WHITE,
                    },
                    "&:not(.Mui-selected) .MuiListItemDecorator-root": {
                        color: WIN95_WHITE,
                    },
                },
            },
        },
        JoyCard: {
            styleOverrides: {
                root: {
                    backgroundColor: WIN95_GRAY,
                    boxShadow: `1px 1px 0px 0px ${WIN95_WHITE} inset, -1px -1px 0px 0px ${WIN95_BLACK} inset, 2px 2px 0px 0px ${WIN95_DKGRAY}`,
                    border: `1px solid ${WIN95_WHITE}`,
                    padding: "4px",
                },
            },
        },
        JoyTooltip: {
            styleOverrides: {
                root: {
                    backgroundColor: "#FFFFE1",
                    color: WIN95_BLACK,
                    border: `1px solid ${WIN95_BLACK}`,
                    boxShadow: "none",
                    fontSize: "12px",
                },
            },
        },
        JoyDivider: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${WIN95_WHITE}`,
                    borderTop: `1px solid ${WIN95_DKGRAY}`,
                    backgroundColor: "transparent",
                },
            },
        },
    },
});

export const doors95ScrollbarStyles: Record<string, any> = {
    "*": { scrollbarWidth: "thin", scrollbarColor: `${WIN95_GRAY} ${WIN95_TEAL}` },
    "*::-webkit-scrollbar": { width: "16px", height: "16px" },
    "*::-webkit-scrollbar-track": {
        background: WIN95_TEAL,
        boxShadow: sunkenWell,
    },
    "*::-webkit-scrollbar-thumb": {
        backgroundColor: WIN95_GRAY,
        boxShadow: bevelUp,
        border: "none",
    },
    "*::-webkit-scrollbar-thumb:hover": { backgroundColor: WIN95_BLUE },
};

export default doors95;
