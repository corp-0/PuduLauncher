import {extendTheme} from "@mui/joy/styles";
import {CSSProperties} from "react";

// DOORS 95 PALETTE
const WIN95_TEAL = "#008080";      // Desktop Background
const WIN95_GRAY = "#C0C0C0";      // Surface/Window Color
const WIN95_BLUE = "#000080";      // Title Bar / Primary
const WIN95_WHITE = "#FFFFFF";     // Highlights
const WIN95_BLACK = "#000000";     // Text / Deep Shadows
const WIN95_DKGRAY = "#808080";    // Shadow mid-tone

// VGA 16-color palette - the only colors Win95 actually had
const WIN95_MAROON = "#800000";
const WIN95_GREEN = "#008000";
const WIN95_OLIVE = "#808000";
// Warm beige gray used in Win95 dialogs and property sheets
const WIN95_BEIGE = "#D4D0C8";

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
                    level2: "#D4D0C8",
                    level3: "#D4D0C8",
                    tooltip: "#FFFFE1",
                    popup: WIN95_GRAY,
                },
                text: {
                    primary: WIN95_BLACK,
                    secondary: "#404040",
                    tertiary: WIN95_DKGRAY,
                    icon: WIN95_BLACK,
                },
                primary: {
                    solidBg: WIN95_BLUE,
                    solidColor: WIN95_WHITE,
                    solidHoverBg: "#1010A0",
                    solidActiveBg: WIN95_BLUE,

                    softBg: WIN95_BEIGE,
                    softColor: WIN95_BLUE,
                    softHoverBg: WIN95_GRAY,
                    softActiveBg: "#B0B0B0",

                    outlinedColor: WIN95_BLUE,
                    outlinedBorder: WIN95_DKGRAY,
                    outlinedHoverBg: WIN95_BEIGE,
                    outlinedActiveBg: WIN95_GRAY,

                    plainColor: WIN95_BLUE,
                    plainHoverBg: WIN95_BEIGE,
                    plainActiveBg: WIN95_GRAY,

                    50: WIN95_BEIGE,
                    100: WIN95_GRAY,
                    200: "#B0B0B0",
                    300: "#8080C0",
                    400: "#4040A0",
                    500: WIN95_BLUE,
                    600: "#000060",
                    700: "#000050",
                    800: "#000040",
                    900: "#000030",
                },
                neutral: {
                    solidBg: WIN95_GRAY,
                    solidColor: WIN95_BLACK,
                    solidHoverBg: "#D4D0C8",
                    solidActiveBg: "#A0A0A0",

                    softBg: "#D4D0C8",
                    softColor: WIN95_BLACK,
                    softHoverBg: WIN95_GRAY,
                    softActiveBg: "#A0A0A0",

                    plainColor: WIN95_BLACK,
                    plainHoverBg: "#D4D0C8",
                    plainActiveBg: WIN95_GRAY,

                    outlinedBorder: WIN95_DKGRAY,
                    outlinedColor: WIN95_BLACK,
                    outlinedHoverBg: "#D4D0C8",
                    outlinedActiveBg: WIN95_GRAY,

                    50: "#F0F0F0",
                    100: "#E0E0E0",
                    200: "#D4D0C8",
                    300: WIN95_GRAY,
                    400: "#A0A0A0",
                    500: WIN95_DKGRAY,
                    600: "#606060",
                    700: "#404040",
                    800: "#303030",
                    900: "#202020",
                },
                danger: {
                    solidBg: WIN95_GRAY,
                    solidColor: WIN95_BLACK,
                    solidHoverBg: WIN95_BLUE,
                    solidActiveBg: WIN95_BLUE,

                    softBg: WIN95_BEIGE,
                    softColor: WIN95_MAROON,
                    softHoverBg: WIN95_GRAY,
                    softActiveBg: "#B0B0B0",

                    outlinedColor: WIN95_MAROON,
                    outlinedBorder: WIN95_DKGRAY,
                    outlinedHoverBg: WIN95_BEIGE,
                    outlinedActiveBg: WIN95_GRAY,

                    plainColor: WIN95_MAROON,
                    plainHoverBg: WIN95_BEIGE,
                    plainActiveBg: WIN95_GRAY,

                    50: WIN95_BEIGE,
                    100: WIN95_GRAY,
                    200: "#B0B0B0",
                    300: "#A05050",
                    400: "#903030",
                    500: WIN95_MAROON,
                    600: "#700000",
                    700: "#600000",
                    800: "#500000",
                    900: "#400000",
                },
                success: {
                    solidBg: WIN95_GRAY,
                    solidColor: WIN95_BLACK,
                    solidHoverBg: WIN95_BLUE,
                    solidActiveBg: WIN95_BLUE,

                    softBg: WIN95_BEIGE,
                    softColor: WIN95_GREEN,
                    softHoverBg: WIN95_GRAY,
                    softActiveBg: "#B0B0B0",

                    outlinedColor: WIN95_GREEN,
                    outlinedBorder: WIN95_DKGRAY,
                    outlinedHoverBg: WIN95_BEIGE,
                    outlinedActiveBg: WIN95_GRAY,

                    plainColor: WIN95_GREEN,
                    plainHoverBg: WIN95_BEIGE,
                    plainActiveBg: WIN95_GRAY,

                    50: WIN95_BEIGE,
                    100: WIN95_GRAY,
                    200: "#B0B0B0",
                    300: "#509050",
                    400: "#309030",
                    500: WIN95_GREEN,
                    600: "#006800",
                    700: "#005000",
                    800: "#004000",
                    900: "#003000",
                },
                warning: {
                    solidBg: WIN95_GRAY,
                    solidColor: WIN95_BLACK,
                    solidHoverBg: WIN95_BLUE,
                    solidActiveBg: WIN95_BLUE,

                    softBg: WIN95_BEIGE,
                    softColor: WIN95_OLIVE,
                    softHoverBg: WIN95_GRAY,
                    softActiveBg: "#B0B0B0",

                    outlinedColor: WIN95_OLIVE,
                    outlinedBorder: WIN95_DKGRAY,
                    outlinedHoverBg: WIN95_BEIGE,
                    outlinedActiveBg: WIN95_GRAY,

                    plainColor: WIN95_OLIVE,
                    plainHoverBg: WIN95_BEIGE,
                    plainActiveBg: WIN95_GRAY,

                    50: WIN95_BEIGE,
                    100: WIN95_GRAY,
                    200: "#B0B0B0",
                    300: "#909050",
                    400: "#888830",
                    500: WIN95_OLIVE,
                    600: "#707000",
                    700: "#606000",
                    800: "#505000",
                    900: "#404000",
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
                root: ({ownerState}) => ({
                    boxShadow: bevelUp,
                    border: "none",
                    padding: "4px 12px",
                    minHeight: "28px",
                    fontWeight: "normal",
                    "&:active": {
                        boxShadow: bevelDown,
                        transform: "translate(1px, 1px)",
                    },
                    ...(ownerState.variant === "solid" && {
                        backgroundColor: WIN95_GRAY,
                        color: WIN95_BLACK,
                        "&:not(.Mui-disabled):hover": {
                            backgroundColor: WIN95_BLUE,
                            color: WIN95_WHITE,
                        },
                    }),
                    ...(ownerState.variant === "solid" && ownerState.color === "primary" && {
                        fontWeight: "bold",
                    }),
                    ...(ownerState.variant === "soft" && {
                        boxShadow: "none",
                        border: `1px solid ${WIN95_DKGRAY}`,
                    }),
                    ...(ownerState.variant === "outlined" && {
                        boxShadow: "none",
                        backgroundColor: WIN95_GRAY,
                    }),
                    ...(ownerState.variant === "plain" && {
                        boxShadow: "none",
                    }),
                }),
            },
        },
        JoyIconButton: {
            styleOverrides: {
                root: ({ownerState}) => ({
                    boxShadow: ownerState.variant === "solid" ? bevelUp : "none",
                    border: "none",
                    "&:active": {
                        boxShadow: ownerState.variant === "solid" ? bevelDown : "none",
                        transform: ownerState.variant === "solid" ? "translate(1px, 1px)" : undefined,
                    },
                    ...(ownerState.variant === "solid" && {
                        backgroundColor: WIN95_GRAY,
                        color: WIN95_BLACK,
                        "&:hover": {
                            backgroundColor: WIN95_BLUE,
                            color: WIN95_WHITE,
                        },
                    }),
                }),
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
                    },
                    "&.Mui-disabled": {
                        backgroundColor: WIN95_GRAY,
                        color: WIN95_DKGRAY,
                    },
                },
            },
        },
        JoyTextarea: {
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
        JoyFormLabel: {
            styleOverrides: {
                root: {
                    color: WIN95_BLACK,
                },
            },
        },
        JoyFormHelperText: {
            styleOverrides: {
                root: {
                    color: WIN95_DKGRAY,
                },
            },
        },
        JoyLink: {
            styleOverrides: {
                root: {
                    color: WIN95_BLUE,
                    "&:hover": {
                        color: "#1010A0",
                    },
                    "&:visited": {
                        color: "#800080",
                    },
                },
            },
        },
        JoySheet: {
            styleOverrides: {
                root: ({ownerState}) => ({
                    color: WIN95_BLACK,
                    ...(ownerState.variant === "outlined" && {
                        backgroundColor: WIN95_GRAY,
                        border: `1px solid ${WIN95_DKGRAY}`,
                    }),
                    ...(ownerState.variant === "soft" && {
                        backgroundColor: "#D4D0C8",
                        color: WIN95_BLACK,
                    }),
                    ...(ownerState.variant === "solid" && {
                        color: WIN95_WHITE,
                    }),
                }),
            },
        },
        JoyCard: {
            styleOverrides: {
                root: {
                    backgroundColor: WIN95_GRAY,
                    color: WIN95_BLACK,
                    boxShadow: `1px 1px 0px 0px ${WIN95_WHITE} inset, -1px -1px 0px 0px ${WIN95_BLACK} inset, 2px 2px 0px 0px ${WIN95_DKGRAY}`,
                    border: `1px solid ${WIN95_WHITE}`,
                    padding: "8px 12px",
                },
            },
        },
        JoyCardContent: {
            styleOverrides: {
                root: {
                    color: WIN95_BLACK,
                },
            },
        },
        JoyCardOverflow: {
            styleOverrides: {
                root: {
                    color: WIN95_BLACK,
                },
            },
        },
        JoyAlert: {
            styleOverrides: {
                root: ({ownerState}) => ({
                    backgroundColor: WIN95_GRAY,
                    color: WIN95_BLACK,
                    boxShadow: bevelUp,
                    border: "none",
                    ...(ownerState.variant === "solid" && {
                        color: WIN95_WHITE,
                    }),
                }),
            },
        },
        JoyChip: {
            styleOverrides: {
                root: ({ownerState}) => ({
                    ...(ownerState.variant !== "solid" && {
                        color: WIN95_BLACK,
                    }),
                }),
            },
        },
        JoySwitch: {
            styleOverrides: {
                track: ({ownerState}) => ({
                    backgroundColor: WIN95_GRAY,
                    boxShadow: sunkenWell,
                    ...(ownerState.checked && {
                        backgroundColor: WIN95_BLUE,
                    }),
                }),
                thumb: {
                    backgroundColor: WIN95_GRAY,
                    boxShadow: bevelUp,
                },
            },
        },
        JoyCheckbox: {
            styleOverrides: {
                checkbox: {
                    backgroundColor: WIN95_WHITE,
                    boxShadow: sunkenWell,
                    borderRadius: 0,
                    border: "none",
                    color: WIN95_BLACK,
                    "&.Mui-checked": {
                        backgroundColor: WIN95_WHITE,
                        color: WIN95_BLACK,
                    },
                },
                label: {
                    color: WIN95_BLACK,
                },
            },
        },
        JoyRadio: {
            styleOverrides: {
                radio: {
                    backgroundColor: WIN95_WHITE,
                    boxShadow: sunkenWell,
                    border: "none",
                    color: WIN95_BLACK,
                    "&.Mui-checked": {
                        backgroundColor: WIN95_WHITE,
                        color: WIN95_BLACK,
                    },
                },
                label: {
                    color: WIN95_BLACK,
                },
            },
        },
        JoySlider: {
            styleOverrides: {
                track: {
                    backgroundColor: WIN95_DKGRAY,
                },
                rail: {
                    backgroundColor: WIN95_GRAY,
                    boxShadow: sunkenWell,
                },
                thumb: {
                    backgroundColor: WIN95_GRAY,
                    boxShadow: bevelUp,
                    borderRadius: 0,
                    width: 11,
                    height: 21,
                },
            },
        },
        JoyLinearProgress: {
            styleOverrides: {
                root: ({ownerState}) => ({
                    backgroundColor: WIN95_GRAY,
                    boxShadow: sunkenWell,
                    "--LinearProgress-progressColor":
                        ownerState.color === "danger" ? WIN95_MAROON
                        : ownerState.color === "success" ? WIN95_GREEN
                        : ownerState.color === "warning" ? WIN95_OLIVE
                        : WIN95_BLUE,
                }),
            },
        },
        JoyCircularProgress: {
            styleOverrides: {
                root: {
                    "--CircularProgress-trackColor": WIN95_GRAY,
                },
            },
        },
        JoyTabs: {
            styleOverrides: {
                root: {
                    backgroundColor: WIN95_GRAY,
                },
            },
        },
        JoyTabList: {
            styleOverrides: {
                root: {
                    backgroundColor: WIN95_GRAY,
                },
            },
        },
        JoyTab: {
            styleOverrides: {
                root: {
                    backgroundColor: WIN95_GRAY,
                    color: WIN95_BLACK,
                    boxShadow: bevelUp,
                    borderRadius: 0,
                    "&.Mui-selected": {
                        backgroundColor: WIN95_GRAY,
                        color: WIN95_BLACK,
                        fontWeight: "bold",
                    },
                    "&:hover": {
                        backgroundColor: "#D4D0C8",
                    },
                },
            },
        },
        JoyTabPanel: {
            styleOverrides: {
                root: {
                    backgroundColor: WIN95_GRAY,
                    color: WIN95_BLACK,
                },
            },
        },
        JoyAccordionSummary: {
            styleOverrides: {
                root: {
                    color: WIN95_BLACK,
                },
                button: {
                    color: `${WIN95_BLACK} !important`,
                    "&:hover": {
                        backgroundColor: "#D4D0C8",
                    },
                },
            },
        },
        JoyAccordionDetails: {
            styleOverrides: {
                root: {
                    color: WIN95_BLACK,
                },
            },
        },
        JoyAccordionGroup: {
            styleOverrides: {
                root: {
                    backgroundColor: WIN95_GRAY,
                },
            },
        },
        JoyTable: {
            styleOverrides: {
                root: {
                    color: WIN95_BLACK,
                    "--TableCell-headBackground": "#D4D0C8",
                    "& thead th": {
                        color: WIN95_BLACK,
                        backgroundColor: "#D4D0C8",
                        fontWeight: "bold",
                    },
                    "& td": {
                        color: WIN95_BLACK,
                    },
                    "--TableRow-stripeBackground": "#D4D0C8",
                    "--TableRow-hoverBackground": "#E0E0E0",
                },
            },
        },
        JoyModal: {
            styleOverrides: {
                root: {
                    "& .MuiModalDialog-root": {
                        backgroundColor: WIN95_GRAY,
                        color: WIN95_BLACK,
                        boxShadow: bevelUp,
                    },
                },
            },
        },
        JoyModalDialog: {
            styleOverrides: {
                root: {
                    backgroundColor: WIN95_GRAY,
                    color: WIN95_BLACK,
                    boxShadow: bevelUp,
                    border: "none",
                },
            },
        },
        JoySnackbar: {
            styleOverrides: {
                root: {
                    backgroundColor: `${WIN95_GRAY} !important`,
                    color: `${WIN95_BLACK} !important`,
                    boxShadow: bevelUp,
                    border: "none",
                    "& .MuiTypography-root": {
                        color: `${WIN95_BLACK} !important`,
                    },
                    "& .MuiButton-root": {
                        color: WIN95_BLACK,
                        borderColor: WIN95_DKGRAY,
                    },
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
        JoyAvatar: {
            styleOverrides: {
                root: ({ownerState}) => ({
                    ...(ownerState.variant !== "solid" && {
                        color: WIN95_BLACK,
                    }),
                }),
            },
        },
        JoyBadge: {
            styleOverrides: {
                badge: {
                    color: WIN95_WHITE,
                },
            },
        },
        JoyBreadcrumbs: {
            styleOverrides: {
                root: {
                    color: WIN95_BLACK,
                },
                separator: {
                    color: WIN95_DKGRAY,
                },
            },
        },
        JoyListItemButton: {
            styleOverrides: {
                root: {
                    color: WIN95_BLACK,
                    "&:hover": {
                        backgroundColor: WIN95_BLUE,
                        color: WIN95_WHITE,
                    },
                    "&.Mui-selected": {
                        backgroundColor: WIN95_BLUE,
                        color: WIN95_WHITE,
                    },
                    "&.Mui-selected .MuiTypography-root": {
                        color: WIN95_WHITE,
                    },
                    // Sidebar items sit on teal background
                    "&:not(.Mui-selected)[data-sidebar]": {
                        color: WIN95_WHITE,
                    },
                },
            },
        },
        JoyListItemContent: {
            styleOverrides: {
                root: {
                    color: "inherit",
                },
            },
        },
        JoyListItemDecorator: {
            styleOverrides: {
                root: {
                    color: "inherit",
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

export const doors95ScrollbarStyles: Record<string, CSSProperties> = {
    "*": {scrollbarWidth: "thin", scrollbarColor: `${WIN95_GRAY} ${WIN95_TEAL}`},
    "*::-webkit-scrollbar": {width: "16px", height: "16px"},
    "*::-webkit-scrollbar-track": {
        background: WIN95_TEAL,
        boxShadow: sunkenWell,
    },
    "*::-webkit-scrollbar-thumb": {
        backgroundColor: WIN95_GRAY,
        boxShadow: bevelUp,
        border: "none",
    },
    "*::-webkit-scrollbar-thumb:hover": {backgroundColor: WIN95_BLUE},
};

export default doors95;
