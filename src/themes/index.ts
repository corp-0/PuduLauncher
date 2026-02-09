import puduTheme from "./pudu"
import unitystationClassicTheme from "./unitystationClassic"

export const themeRegistry = {
    unitystationClassic: unitystationClassicTheme,
    pudu: puduTheme,
} as const;

export type ThemeId = keyof typeof themeRegistry;