import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { PreferencesApi } from "../pudu/generated";
import { ThemeId, themeRegistry } from "../themes";

interface ThemeContextType {
    themeId: ThemeId;
    changeThemeId: (themeId: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = "stored-theme";
const DEFAULT_THEME_ID: ThemeId = "pudu";

const THEME_ID_TO_PREFERENCE: Record<ThemeId, string> = {
    hotdogStand: "Hotdog Stand",
    pudu: "Pudu",
    unitystationClassic: "Unitystation Classic",
    australNight: "Austral Forest Night",
    doors95: "Doors95"
};

const normalizeThemeToken = (value: string): string => (
    value.toLowerCase().replace(/[^a-z0-9]/g, "")
);

const THEME_TOKEN_TO_ID: Record<string, ThemeId> = Object.entries(themeRegistry).reduce(
    (accumulator, [themeId]) => {
        const id = themeId as ThemeId;
        accumulator[normalizeThemeToken(id)] = id;
        return accumulator;
    },
    {} as Record<string, ThemeId>,
);

Object.entries(THEME_ID_TO_PREFERENCE).forEach(([themeId, preferenceValue]) => {
    THEME_TOKEN_TO_ID[normalizeThemeToken(preferenceValue)] = themeId as ThemeId;
});

const isThemeId = (value: unknown): value is ThemeId => (
    typeof value === "string" && value in themeRegistry
);

const parseThemeId = (value: unknown): ThemeId | null => {
    if (isThemeId(value)) {
        return value;
    }

    if (typeof value !== "string") {
        return null;
    }

    return THEME_TOKEN_TO_ID[normalizeThemeToken(value)] ?? null;
};

const readStoredThemeId = (): ThemeId | null => {
    return parseThemeId(localStorage.getItem(THEME_STORAGE_KEY));
};

export const themePreferenceValueToThemeId = (value: unknown): ThemeId | null => {
    return parseThemeId(value);
};

export const themeIdToPreferenceValue = (themeId: ThemeId): string => {
    return THEME_ID_TO_PREFERENCE[themeId];
};

export function ThemeProvider(props: PropsWithChildren) {
    const [themeId, setThemeId] = useState<ThemeId>(() => readStoredThemeId() ?? DEFAULT_THEME_ID);

    const changeThemeId = (newThemeId: ThemeId) => {
        setThemeId(newThemeId);
        localStorage.setItem(THEME_STORAGE_KEY, newThemeId);
    };

    useEffect(() => {
        if (readStoredThemeId() !== null) {
            return;
        }

        void (async () => {
            const api = new PreferencesApi();
            try {
                const result = await api.getPreferences();
                if (!result.success || !result.data) {
                    return;
                }

                const backendThemeId = parseThemeId(result.data.launcher?.theme);
                if (backendThemeId) {
                    changeThemeId(backendThemeId);
                }
            } catch {
                // localStorage-first fallback: keep current theme when backend is unavailable
            }
        })();
    }, []);

    return (
        <ThemeContext.Provider value={{ themeId, changeThemeId }}>
            {props.children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useThemeContext must be used within a ThemeProvider");
    }
    return context;
}
