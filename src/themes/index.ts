import australNightTheme, { australNightScrollbarStyles } from "./australNight";
import doors95Theme, { doors95ScrollbarStyles } from "./doors95";
import hotdogStandTheme, { hotdogStandScrollbarStyles } from "./hotdogStand"
import puduTheme, { puduScrollbarStyles } from "./pudu"
import unitystationClassicTheme, { unitystationClassicScrollbarStyles } from "./unitystationClassic"
import { CSSProperties } from "react";

export const themeRegistry = {
    hotdogStand: hotdogStandTheme,
    australNight: australNightTheme,
    doors95: doors95Theme,
    unitystationClassic: unitystationClassicTheme,
    pudu: puduTheme,
} as const;

export type ThemeId = keyof typeof themeRegistry;

export const themeScrollbarRegistry: Record<ThemeId, Record<string, CSSProperties>> = {
    hotdogStand: hotdogStandScrollbarStyles,
    australNight: australNightScrollbarStyles,
    doors95: doors95ScrollbarStyles,
    unitystationClassic: unitystationClassicScrollbarStyles,
    pudu: puduScrollbarStyles,
};
