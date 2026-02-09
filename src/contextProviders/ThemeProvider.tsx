import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { ThemeId } from "../themes";

interface ThemeContextType {
    themeId: ThemeId;
    changeThemeId: (themeId: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider(props: PropsWithChildren) {
    const [themeId, setThemeId] = useState<ThemeId>("pudu");

    useEffect(() => {
        const readFromLocalstorage = () => {
            const storedTheme = localStorage.getItem("stored-theme") as ThemeId | null;
            if (storedTheme) {
                setThemeId(storedTheme);
            } else {
                changeThemeId("pudu");
            }
        }

        readFromLocalstorage();
        //todo: persist into Preferences when implemented
    }, []);

    const changeThemeId = (newThemeId: ThemeId) => {
        setThemeId(newThemeId);
        localStorage.setItem("stored-theme", newThemeId);
    };

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