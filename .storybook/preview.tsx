import "@fontsource/inter";
import { CssBaseline, CssVarsProvider } from "@mui/joy";
import type { Preview } from "@storybook/react-vite";
import { themeRegistry, type ThemeId } from "../src/themes";

const availableThemes = Object.keys(themeRegistry) as ThemeId[];
const defaultTheme: ThemeId = "pudu";

const preview: Preview = {
  globalTypes: {
    appTheme: {
      name: "Theme",
      description: "Select app theme",
      defaultValue: defaultTheme,
      toolbar: {
        icon: "paintbrush",
        dynamicTitle: true,
        items: availableThemes.map((themeId) => ({
          value: themeId,
          title: themeId,
        })),
      },
    },
  },
  initialGlobals: {
    appTheme: defaultTheme,
  },
  decorators: [
    (Story, context) => (
      <CssVarsProvider
        defaultMode="dark"
        modeStorageKey="pudu-color-mode-storybook"
        theme={themeRegistry[(context.globals.appTheme as ThemeId) ?? defaultTheme]}
      >
        <CssBaseline />
        <Story />
      </CssVarsProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
    layout: "padded",
  },
};

export default preview;
