import "@fontsource/inter";
import { CssBaseline, CssVarsProvider } from "@mui/joy";
import type { Preview } from "@storybook/react-vite";
import { puduTheme } from "../src/themes";

const preview: Preview = {
  decorators: [
    (Story) => (
      <CssVarsProvider defaultMode="dark" modeStorageKey="pudu-color-mode" theme={puduTheme}>
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
