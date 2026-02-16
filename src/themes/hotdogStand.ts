import { extendTheme } from "@mui/joy/styles";

// SOFTENED VGA COLORS
const RETRO_RED = "#CC0000";
const RETRO_YELLOW = "#FFD700";
const RETRO_BLACK = "#111111";
const RETRO_WHITE = "#F0F0F0";

const hotdogStandTheme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        background: {
          body: RETRO_RED,
          surface: RETRO_RED,
          popup: RETRO_YELLOW,
          level1: RETRO_RED,
          level2: RETRO_RED,
          level3: RETRO_RED,
          tooltip: RETRO_YELLOW, // Tooltip background is Yellow
        },
        text: {
          primary: RETRO_YELLOW, // Global text is Yellow (for Red backgrounds)
          secondary: RETRO_WHITE,
          tertiary: RETRO_BLACK,
          icon: RETRO_YELLOW,
        },
        primary: {
          softBg: RETRO_YELLOW,
          softColor: RETRO_BLACK,
          softHoverBg: RETRO_WHITE,
          softActiveBg: RETRO_WHITE,
          solidBg: RETRO_YELLOW,
          solidColor: RETRO_BLACK,
          solidHoverBg: RETRO_WHITE,
          solidActiveBg: RETRO_WHITE,

          outlinedBorder: RETRO_YELLOW,
          outlinedColor: RETRO_YELLOW,
          outlinedHoverBg: "rgba(255, 215, 0, 0.12)",
          outlinedActiveBg: "rgba(255, 215, 0, 0.2)",
          plainColor: RETRO_YELLOW,
          plainHoverBg: "rgba(255, 215, 0, 0.12)",
          plainActiveBg: "rgba(255, 215, 0, 0.2)",

          50: "#fffbe0",
          100: "#fff3b3",
          200: "#ffe97a",
          300: "#ffdd3d",
          400: "#ffd700",
          500: "#e6bf00",
          600: "#c9a600",
          700: "#a88a00",
          800: "#826b00",
          900: "#5e4d00",
        },
        neutral: {
          solidBg: RETRO_BLACK,
          solidColor: RETRO_YELLOW,
          plainColor: RETRO_BLACK,
          outlinedBorder: RETRO_BLACK,

          50: RETRO_YELLOW,
          100: RETRO_YELLOW,
          200: RETRO_YELLOW,
          300: RETRO_YELLOW,
          400: RETRO_YELLOW,
          500: RETRO_YELLOW,
          600: RETRO_YELLOW,
          700: RETRO_YELLOW,
          800: RETRO_YELLOW,
          900: RETRO_YELLOW,
        },
        danger: {
          solidBg: RETRO_WHITE,
          solidColor: RETRO_RED,
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
    JoyTooltip: {
      styleOverrides: {
        root: {
          // FIX: Force tooltip text to be Black so it is visible on Yellow
          color: RETRO_BLACK,
          backgroundColor: RETRO_YELLOW,
          border: `1px solid ${RETRO_BLACK}`, // Added a border for definition
          fontWeight: "bold",
        },
      },
    },
    JoyButton: {
      styleOverrides: {
        root: {
          border: `2px solid ${RETRO_BLACK}`,
          boxShadow: `2px 2px 0px 0px ${RETRO_BLACK}`,
          "&.MuiButton-colorPrimary": {
            color: RETRO_BLACK,
          },
          "&.MuiButton-variantSoft.MuiButton-colorPrimary": {
            backgroundColor: RETRO_YELLOW,
            color: RETRO_BLACK,
          },
          "&.MuiButton-variantSoft.MuiButton-colorPrimary:hover": {
            backgroundColor: RETRO_WHITE,
            color: RETRO_BLACK,
          },
          "&.MuiButton-variantSoft.MuiButton-colorPrimary:active": {
            backgroundColor: RETRO_WHITE,
            color: RETRO_BLACK,
          },
          "&.MuiButton-variantSolid.MuiButton-colorPrimary": {
            backgroundColor: RETRO_YELLOW,
            color: RETRO_BLACK,
          },
          "&.MuiButton-variantSolid.MuiButton-colorPrimary:hover": {
            backgroundColor: RETRO_WHITE,
            color: RETRO_BLACK,
          },
          "&.MuiButton-variantSolid.MuiButton-colorPrimary:active": {
            backgroundColor: RETRO_WHITE,
            color: RETRO_BLACK,
          },
          "&:active": {
            transform: "translate(2px, 2px)",
            boxShadow: "none",
          },
        },
      },
    },
    JoyCard: {
      styleOverrides: {
        root: {
          border: `2px solid ${RETRO_YELLOW}`,
          backgroundColor: RETRO_BLACK,
        },
      },
    },
    JoyInput: {
      styleOverrides: {
        root: {
          backgroundColor: RETRO_WHITE,
          color: RETRO_BLACK,
          border: `2px solid ${RETRO_BLACK}`,
        }
      }
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
    JoySelect: {
      styleOverrides: {
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
  },
});

export const hotdogStandScrollbarStyles: Record<string, any> = {
  "*": { scrollbarWidth: "thin", scrollbarColor: `${RETRO_YELLOW} ${RETRO_RED}` },
  "*::-webkit-scrollbar": { width: "12px", height: "12px" },
  "*::-webkit-scrollbar-track": { background: RETRO_RED },
  "*::-webkit-scrollbar-thumb": { backgroundColor: RETRO_YELLOW, border: `2px solid ${RETRO_RED}`, borderRadius: "0px" },
  "*::-webkit-scrollbar-thumb:hover": { backgroundColor: RETRO_WHITE },
};

export default hotdogStandTheme;
