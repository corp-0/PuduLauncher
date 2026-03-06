import {extendTheme} from "@mui/joy/styles";
import {CSSProperties} from "react";

// THE UNHOLY TRINITY
const RETRO_RED = "#CC0000";
const RETRO_YELLOW = "#FFD700";
const RETRO_BLACK = "#111111";
const RETRO_WHITE = "#F0F0F0";
const RETRO_DKRED = "#990000";

const hotdogStandTheme = extendTheme({
    colorSchemes: {
        dark: {
            palette: {
                background: {
                    body: RETRO_RED,
                    surface: RETRO_RED,
                    popup: RETRO_YELLOW,
                    level1: RETRO_RED,
                    level2: RETRO_DKRED,
                    level3: RETRO_DKRED,
                    tooltip: RETRO_YELLOW,
                },
                text: {
                    primary: RETRO_YELLOW,
                    secondary: RETRO_WHITE,
                    tertiary: "#CC9900",
                    icon: RETRO_YELLOW,
                },
                primary: {
                    solidBg: RETRO_YELLOW,
                    solidColor: RETRO_BLACK,
                    solidHoverBg: RETRO_WHITE,
                    solidActiveBg: RETRO_WHITE,

                    softBg: RETRO_DKRED,
                    softColor: RETRO_YELLOW,
                    softHoverBg: RETRO_RED,
                    softActiveBg: RETRO_BLACK,

                    outlinedBorder: RETRO_YELLOW,
                    outlinedColor: RETRO_YELLOW,
                    outlinedHoverBg: "rgba(255, 215, 0, 0.15)",
                    outlinedActiveBg: "rgba(255, 215, 0, 0.25)",

                    plainColor: RETRO_YELLOW,
                    plainHoverBg: "rgba(255, 215, 0, 0.15)",
                    plainActiveBg: "rgba(255, 215, 0, 0.25)",

                    50: "#fffbe0",
                    100: "#fff3b3",
                    200: "#ffe97a",
                    300: "#ffdd3d",
                    400: RETRO_YELLOW,
                    500: "#e6bf00",
                    600: "#c9a600",
                    700: "#a88a00",
                    800: "#826b00",
                    900: "#5e4d00",
                },
                neutral: {
                    solidBg: RETRO_BLACK,
                    solidColor: RETRO_YELLOW,
                    solidHoverBg: "#333333",
                    solidActiveBg: RETRO_BLACK,

                    softBg: RETRO_DKRED,
                    softColor: RETRO_YELLOW,
                    softHoverBg: RETRO_RED,
                    softActiveBg: RETRO_BLACK,

                    plainColor: RETRO_YELLOW,
                    plainHoverBg: "rgba(255, 215, 0, 0.10)",
                    plainActiveBg: "rgba(255, 215, 0, 0.20)",

                    outlinedBorder: RETRO_YELLOW,
                    outlinedColor: RETRO_YELLOW,
                    outlinedHoverBg: "rgba(255, 215, 0, 0.10)",
                    outlinedActiveBg: "rgba(255, 215, 0, 0.20)",

                    50: RETRO_YELLOW,
                    100: "#e6bf00",
                    200: "#c9a600",
                    300: "#a88a00",
                    400: "#826b00",
                    500: "#5e4d00",
                    600: "#444444",
                    700: "#333333",
                    800: "#222222",
                    900: RETRO_BLACK,
                },
                danger: {
                    solidBg: RETRO_YELLOW,
                    solidColor: RETRO_RED,
                    solidHoverBg: RETRO_WHITE,
                    solidActiveBg: RETRO_WHITE,

                    softBg: RETRO_DKRED,
                    softColor: RETRO_YELLOW,
                    softHoverBg: RETRO_RED,
                    softActiveBg: RETRO_BLACK,

                    outlinedBorder: RETRO_YELLOW,
                    outlinedColor: RETRO_YELLOW,
                    outlinedHoverBg: "rgba(255, 215, 0, 0.15)",
                    outlinedActiveBg: "rgba(255, 215, 0, 0.25)",

                    plainColor: RETRO_YELLOW,
                    plainHoverBg: "rgba(255, 215, 0, 0.15)",
                    plainActiveBg: "rgba(255, 215, 0, 0.25)",

                    50: "#fffbe0",
                    100: "#fff3b3",
                    200: "#ffe97a",
                    300: RETRO_YELLOW,
                    400: "#e6bf00",
                    500: RETRO_RED,
                    600: RETRO_DKRED,
                    700: "#770000",
                    800: "#550000",
                    900: "#330000",
                },
                success: {
                    solidBg: RETRO_YELLOW,
                    solidColor: RETRO_BLACK,
                    solidHoverBg: RETRO_WHITE,
                    solidActiveBg: RETRO_WHITE,

                    softBg: RETRO_DKRED,
                    softColor: RETRO_YELLOW,
                    softHoverBg: RETRO_RED,
                    softActiveBg: RETRO_BLACK,

                    outlinedBorder: RETRO_YELLOW,
                    outlinedColor: RETRO_YELLOW,
                    outlinedHoverBg: "rgba(255, 215, 0, 0.15)",
                    outlinedActiveBg: "rgba(255, 215, 0, 0.25)",

                    plainColor: RETRO_YELLOW,
                    plainHoverBg: "rgba(255, 215, 0, 0.15)",
                    plainActiveBg: "rgba(255, 215, 0, 0.25)",

                    50: "#fffbe0",
                    100: "#fff3b3",
                    200: "#ffe97a",
                    300: RETRO_YELLOW,
                    400: "#e6bf00",
                    500: "#c9a600",
                    600: "#a88a00",
                    700: "#826b00",
                    800: "#5e4d00",
                    900: "#3d3200",
                },
                warning: {
                    solidBg: RETRO_YELLOW,
                    solidColor: RETRO_BLACK,
                    solidHoverBg: RETRO_WHITE,
                    solidActiveBg: RETRO_WHITE,

                    softBg: RETRO_DKRED,
                    softColor: RETRO_YELLOW,
                    softHoverBg: RETRO_RED,
                    softActiveBg: RETRO_BLACK,

                    outlinedBorder: RETRO_YELLOW,
                    outlinedColor: RETRO_YELLOW,
                    outlinedHoverBg: "rgba(255, 215, 0, 0.15)",
                    outlinedActiveBg: "rgba(255, 215, 0, 0.25)",

                    plainColor: RETRO_YELLOW,
                    plainHoverBg: "rgba(255, 215, 0, 0.15)",
                    plainActiveBg: "rgba(255, 215, 0, 0.25)",

                    50: "#fffbe0",
                    100: "#fff3b3",
                    200: "#ffe97a",
                    300: RETRO_YELLOW,
                    400: "#e6bf00",
                    500: "#c9a600",
                    600: "#a88a00",
                    700: "#826b00",
                    800: "#5e4d00",
                    900: "#3d3200",
                },
                divider: RETRO_YELLOW,
                focusVisible: RETRO_WHITE,
            },
        },
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
        md: `4px 4px 0px 0px ${RETRO_BLACK}`,
        lg: "none",
        xl: "none",
    },
    fontFamily: {
        body: '"Tahoma", "MS Sans Serif", "Microsoft Sans Serif", "Segoe UI", sans-serif',
        display: '"Tahoma", "MS Sans Serif", "Microsoft Sans Serif", "Segoe UI", sans-serif',
        code: '"Lucida Console", "Courier New", monospace',
    },
    components: {
        JoyButton: {
            styleOverrides: {
                root: ({ownerState}) => ({
                    border: `2px solid ${RETRO_BLACK}`,
                    boxShadow: `2px 2px 0px 0px ${RETRO_BLACK}`,
                    "&:active": {
                        transform: "translate(2px, 2px)",
                        boxShadow: "none",
                    },
                    ...(ownerState.variant === "solid" && {
                        backgroundColor: RETRO_YELLOW,
                        color: RETRO_BLACK,
                        "&:hover": {
                            backgroundColor: RETRO_WHITE,
                            color: RETRO_BLACK,
                        },
                    }),
                    ...(ownerState.variant === "soft" && {
                        backgroundColor: RETRO_DKRED,
                        color: RETRO_YELLOW,
                        "&:hover": {
                            backgroundColor: RETRO_BLACK,
                            color: RETRO_YELLOW,
                        },
                    }),
                    ...(ownerState.variant === "outlined" && {
                        backgroundColor: "transparent",
                        color: RETRO_YELLOW,
                        borderColor: RETRO_YELLOW,
                        "&:hover": {
                            backgroundColor: "rgba(255, 215, 0, 0.15)",
                        },
                    }),
                    ...(ownerState.variant === "plain" && {
                        backgroundColor: "transparent",
                        color: RETRO_YELLOW,
                        border: "none",
                        boxShadow: "none",
                        "&:hover": {
                            backgroundColor: "rgba(255, 215, 0, 0.15)",
                        },
                    }),
                }),
            },
        },
        JoyIconButton: {
            styleOverrides: {
                root: ({ownerState}) => ({
                    ...(ownerState.variant === "solid" && {
                        backgroundColor: RETRO_YELLOW,
                        color: RETRO_BLACK,
                        border: `2px solid ${RETRO_BLACK}`,
                        "&:hover": {
                            backgroundColor: RETRO_WHITE,
                            color: RETRO_BLACK,
                        },
                    }),
                    ...(ownerState.variant === "plain" && {
                        color: RETRO_YELLOW,
                    }),
                }),
            },
        },
        JoyInput: {
            styleOverrides: {
                root: {
                    backgroundColor: RETRO_YELLOW,
                    color: RETRO_BLACK,
                    border: `2px solid ${RETRO_BLACK}`,
                    "&::before": {display: "none"},
                    "&.Mui-disabled": {
                        backgroundColor: RETRO_DKRED,
                        color: "#CC9900",
                    },
                },
            },
        },
        JoyTextarea: {
            styleOverrides: {
                root: {
                    backgroundColor: RETRO_YELLOW,
                    color: RETRO_BLACK,
                    border: `2px solid ${RETRO_BLACK}`,
                    "&::before": {display: "none"},
                },
            },
        },
        JoySelect: {
            styleOverrides: {
                root: {
                    backgroundColor: RETRO_YELLOW,
                    color: RETRO_BLACK,
                    border: `2px solid ${RETRO_BLACK}`,
                    "&::before": {display: "none"},
                },
                indicator: {
                    color: RETRO_BLACK,
                },
                listbox: {
                    backgroundColor: RETRO_YELLOW,
                    color: RETRO_BLACK,
                    border: `2px solid ${RETRO_BLACK}`,
                    "& .MuiOption-root": {
                        backgroundColor: `${RETRO_YELLOW} !important`,
                        color: `${RETRO_BLACK} !important`,
                    },
                    "& .MuiOption-root:hover, & .MuiOption-root.MuiOption-highlighted": {
                        backgroundColor: `${RETRO_BLACK} !important`,
                        color: `${RETRO_YELLOW} !important`,
                    },
                    "& .MuiOption-root[aria-selected='true']": {
                        backgroundColor: `${RETRO_BLACK} !important`,
                        color: `${RETRO_YELLOW} !important`,
                    },
                },
            },
        },
        JoyOption: {
            styleOverrides: {
                root: {
                    color: RETRO_BLACK,
                    backgroundColor: RETRO_YELLOW,
                    "&:hover": {
                        backgroundColor: RETRO_BLACK,
                        color: RETRO_YELLOW,
                    },
                    "&[aria-selected='true']": {
                        backgroundColor: RETRO_BLACK,
                        color: RETRO_YELLOW,
                    },
                    "&[aria-selected='true']:hover": {
                        backgroundColor: RETRO_BLACK,
                        color: RETRO_YELLOW,
                    },
                },
            },
        },
        JoyFormLabel: {
            styleOverrides: {
                root: {
                    color: RETRO_YELLOW,
                },
            },
        },
        JoyFormHelperText: {
            styleOverrides: {
                root: {
                    color: "#CC9900",
                },
            },
        },
        JoyLink: {
            styleOverrides: {
                root: {
                    color: RETRO_YELLOW,
                    fontWeight: "bold",
                    "&:hover": {
                        color: RETRO_WHITE,
                    },
                },
            },
        },
        JoyCard: {
            styleOverrides: {
                root: {
                    border: `2px solid ${RETRO_YELLOW}`,
                    backgroundColor: RETRO_BLACK,
                    color: RETRO_YELLOW,
                    padding: "8px 12px",
                },
            },
        },
        JoyCardContent: {
            styleOverrides: {
                root: {
                    color: RETRO_YELLOW,
                },
            },
        },
        JoyCardOverflow: {
            styleOverrides: {
                root: {
                    color: RETRO_YELLOW,
                },
            },
        },
        JoySheet: {
            styleOverrides: {
                root: ({ownerState}) => ({
                    color: RETRO_YELLOW,
                    backgroundColor: RETRO_RED,
                    ...(ownerState.variant === "outlined" && {
                        border: `2px solid ${RETRO_YELLOW}`,
                    }),
                    ...(ownerState.variant === "soft" && {
                        backgroundColor: RETRO_DKRED,
                    }),
                    ...(ownerState.variant === "solid" && {
                        backgroundColor: RETRO_BLACK,
                    }),
                }),
            },
        },
        JoyAlert: {
            styleOverrides: {
                root: ({ownerState}) => ({
                    backgroundColor: RETRO_YELLOW,
                    color: RETRO_BLACK,
                    border: `2px solid ${RETRO_BLACK}`,
                    ...(ownerState.variant === "soft" && {
                        backgroundColor: RETRO_DKRED,
                        color: RETRO_YELLOW,
                        border: `2px solid ${RETRO_YELLOW}`,
                    }),
                    ...(ownerState.variant === "solid" && {
                        backgroundColor: RETRO_BLACK,
                        color: RETRO_YELLOW,
                        border: `2px solid ${RETRO_YELLOW}`,
                    }),
                }),
            },
        },
        JoyChip: {
            styleOverrides: {
                root: ({ownerState}) => ({
                    ...(ownerState.variant === "solid" && {
                        backgroundColor: RETRO_YELLOW,
                        color: RETRO_BLACK,
                    }),
                    ...(ownerState.variant === "soft" && {
                        backgroundColor: RETRO_DKRED,
                        color: RETRO_YELLOW,
                    }),
                    ...(ownerState.variant === "outlined" && {
                        color: RETRO_YELLOW,
                        borderColor: RETRO_YELLOW,
                    }),
                }),
            },
        },
        JoySwitch: {
            styleOverrides: {
                track: ({ownerState}) => ({
                    backgroundColor: RETRO_BLACK,
                    border: `2px solid ${RETRO_YELLOW}`,
                    ...(ownerState.checked && {
                        backgroundColor: RETRO_YELLOW,
                    }),
                }),
                thumb: {
                    backgroundColor: RETRO_RED,
                },
            },
        },
        JoyCheckbox: {
            styleOverrides: {
                checkbox: {
                    backgroundColor: RETRO_YELLOW,
                    border: `2px solid ${RETRO_BLACK}`,
                    color: RETRO_BLACK,
                    "&.Mui-checked": {
                        backgroundColor: RETRO_YELLOW,
                        color: RETRO_BLACK,
                    },
                },
                label: {
                    color: RETRO_YELLOW,
                },
            },
        },
        JoyRadio: {
            styleOverrides: {
                radio: {
                    backgroundColor: RETRO_YELLOW,
                    border: `2px solid ${RETRO_BLACK}`,
                    color: RETRO_BLACK,
                    "&.Mui-checked": {
                        backgroundColor: RETRO_YELLOW,
                        color: RETRO_BLACK,
                    },
                },
                label: {
                    color: RETRO_YELLOW,
                },
            },
        },
        JoySlider: {
            styleOverrides: {
                track: {
                    backgroundColor: RETRO_YELLOW,
                },
                rail: {
                    backgroundColor: RETRO_BLACK,
                },
                thumb: {
                    backgroundColor: RETRO_YELLOW,
                    border: `2px solid ${RETRO_BLACK}`,
                },
            },
        },
        JoyLinearProgress: {
            styleOverrides: {
                root: {
                    backgroundColor: RETRO_BLACK,
                    border: `2px solid ${RETRO_YELLOW}`,
                    "--LinearProgress-progressColor": RETRO_YELLOW,
                },
            },
        },
        JoyCircularProgress: {
            styleOverrides: {
                root: {
                    "--CircularProgress-trackColor": RETRO_BLACK,
                    "--CircularProgress-progressColor": RETRO_YELLOW,
                },
            },
        },
        JoyTabs: {
            styleOverrides: {
                root: {
                    backgroundColor: RETRO_RED,
                },
            },
        },
        JoyTabList: {
            styleOverrides: {
                root: {
                    backgroundColor: RETRO_RED,
                },
            },
        },
        JoyTab: {
            styleOverrides: {
                root: {
                    backgroundColor: RETRO_RED,
                    color: RETRO_YELLOW,
                    border: `2px solid ${RETRO_YELLOW}`,
                    "&.Mui-selected": {
                        backgroundColor: RETRO_YELLOW,
                        color: RETRO_BLACK,
                        fontWeight: "bold",
                    },
                    "&:hover": {
                        backgroundColor: RETRO_BLACK,
                    },
                },
            },
        },
        JoyTabPanel: {
            styleOverrides: {
                root: {
                    backgroundColor: RETRO_RED,
                    color: RETRO_YELLOW,
                },
            },
        },
        JoyAccordionSummary: {
            styleOverrides: {
                root: {
                    color: RETRO_YELLOW,
                },
                button: {
                    color: `${RETRO_YELLOW} !important`,
                    "&:hover": {
                        backgroundColor: RETRO_BLACK,
                    },
                },
            },
        },
        JoyAccordionDetails: {
            styleOverrides: {
                root: {
                    color: RETRO_YELLOW,
                },
            },
        },
        JoyAccordionGroup: {
            styleOverrides: {
                root: {
                    backgroundColor: RETRO_RED,
                    border: `2px solid ${RETRO_YELLOW}`,
                },
            },
        },
        JoyTable: {
            styleOverrides: {
                root: {
                    color: RETRO_YELLOW,
                    "& thead th": {
                        color: RETRO_BLACK,
                        backgroundColor: RETRO_YELLOW,
                        fontWeight: "bold",
                    },
                    "& td": {
                        color: RETRO_YELLOW,
                    },
                    "--TableRow-stripeBackground": RETRO_DKRED,
                    "--TableRow-hoverBackground": RETRO_BLACK,
                },
            },
        },
        JoyModal: {
            styleOverrides: {
                root: {
                    "& .MuiModalDialog-root": {
                        backgroundColor: RETRO_RED,
                        color: RETRO_YELLOW,
                        border: `2px solid ${RETRO_YELLOW}`,
                    },
                },
            },
        },
        JoyModalDialog: {
            styleOverrides: {
                root: {
                    backgroundColor: RETRO_RED,
                    color: RETRO_YELLOW,
                    border: `2px solid ${RETRO_YELLOW}`,
                },
            },
        },
        JoySnackbar: {
            styleOverrides: {
                root: {
                    backgroundColor: `${RETRO_YELLOW} !important`,
                    color: `${RETRO_BLACK} !important`,
                    border: `2px solid ${RETRO_BLACK}`,
                    "& .MuiTypography-root": {
                        color: `${RETRO_BLACK} !important`,
                    },
                    "& .MuiButton-root": {
                        color: RETRO_BLACK,
                        borderColor: RETRO_BLACK,
                    },
                },
            },
        },
        JoyTooltip: {
            styleOverrides: {
                root: {
                    color: RETRO_BLACK,
                    backgroundColor: RETRO_YELLOW,
                    border: `1px solid ${RETRO_BLACK}`,
                    fontWeight: "bold",
                },
            },
        },
        JoyAvatar: {
            styleOverrides: {
                root: {
                    backgroundColor: RETRO_YELLOW,
                    color: RETRO_BLACK,
                },
            },
        },
        JoyBadge: {
            styleOverrides: {
                badge: {
                    backgroundColor: RETRO_YELLOW,
                    color: RETRO_BLACK,
                },
            },
        },
        JoyBreadcrumbs: {
            styleOverrides: {
                root: {
                    color: RETRO_YELLOW,
                },
                separator: {
                    color: RETRO_YELLOW,
                },
            },
        },
        JoyListItemButton: {
            styleOverrides: {
                root: {
                    color: RETRO_YELLOW,
                    "&:hover": {
                        backgroundColor: RETRO_BLACK,
                        color: RETRO_YELLOW,
                    },
                    "&.Mui-selected": {
                        backgroundColor: RETRO_YELLOW,
                        color: RETRO_BLACK,
                    },
                    "&.Mui-selected .MuiTypography-root": {
                        color: RETRO_BLACK,
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
                    borderColor: RETRO_YELLOW,
                    backgroundColor: "transparent",
                },
            },
        },
    },
});

export const hotdogStandScrollbarStyles: Record<string, CSSProperties> = {
    "*": {scrollbarWidth: "thin", scrollbarColor: `${RETRO_YELLOW} ${RETRO_RED}`},
    "*::-webkit-scrollbar": {width: "12px", height: "12px"},
    "*::-webkit-scrollbar-track": {background: RETRO_RED},
    "*::-webkit-scrollbar-thumb": {
        backgroundColor: RETRO_YELLOW,
        border: `2px solid ${RETRO_RED}`,
        borderRadius: "0px",
    },
    "*::-webkit-scrollbar-thumb:hover": {backgroundColor: RETRO_WHITE},
};

export default hotdogStandTheme;
