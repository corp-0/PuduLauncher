import { createContext, type PropsWithChildren, useContext, useEffect, useRef, useState } from "react";
import type { Preferences } from "../pudu/generated";
import { InstallationsApi, PreferencesApi } from "../pudu/generated";
import { useErrorContext } from "./ErrorContextProvider";

interface PreferencesContextValue {
    preferences: Preferences | null;
    isLoading: boolean;
    isSaving: boolean;
    updateField: (categoryKey: string, fieldKey: string, value: unknown) => void;
    moveInstallationPath: (newPath: string) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

const DEBOUNCE_MS = 500;

export function PreferencesContextProvider(props: PropsWithChildren) {
    const { children } = props;
    const { showError } = useErrorContext();
    const [preferences, setPreferences] = useState<Preferences | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestPrefsRef = useRef<Preferences | null>(null);

    useEffect(() => {
        void (async () => {
            const api = new PreferencesApi();
            try {
                const result = await api.getPreferences();
                if (result.success && result.data) {
                    setPreferences(result.data);
                    latestPrefsRef.current = result.data;
                } else {
                    showError({
                        source: "frontend.preferences.get-preferences",
                        userMessage: "Failed to load preferences.",
                        code: "PREFERENCES_FETCH_FAILED",
                        technicalDetails: result.error ?? "Unknown backend error.",
                    });
                }
            } catch (error: unknown) {
                showError({
                    source: "frontend.preferences.get-preferences",
                    userMessage: "Failed to load preferences.",
                    code: "PREFERENCES_FETCH_EXCEPTION",
                    technicalDetails: error instanceof Error ? error.toString() : String(error),
                });
            } finally {
                setIsLoading(false);
            }
        })();
    }, [showError]);

    const persistPreferences = (prefs: Preferences) => {
        if (debounceRef.current !== null) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            debounceRef.current = null;
            void (async () => {
                setIsSaving(true);
                const api = new PreferencesApi();
                try {
                    const result = await api.updatePreferences(prefs);
                    if (!result.success) {
                        showError({
                            source: "frontend.preferences.update-preferences",
                            userMessage: "Failed to save preferences.",
                            code: "PREFERENCES_UPDATE_FAILED",
                            technicalDetails: result.error ?? "Unknown backend error.",
                        });
                    }
                } catch (error: unknown) {
                    showError({
                        source: "frontend.preferences.update-preferences",
                        userMessage: "Failed to save preferences.",
                        code: "PREFERENCES_UPDATE_EXCEPTION",
                        technicalDetails: error instanceof Error ? error.toString() : String(error),
                    });
                } finally {
                    setIsSaving(false);
                }
            })();
        }, DEBOUNCE_MS);
    };

    useEffect(() => {
        return () => {
            if (debounceRef.current !== null) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const moveInstallationPath = async (newPath: string) => {
        if (debounceRef.current !== null) {
            clearTimeout(debounceRef.current);
        }

        setIsSaving(true);
        const api = new InstallationsApi();
        try {
            const result = await api.moveInstallations(newPath);
            if (result.success) {
                setPreferences((prev) => {
                    if (prev === null) return prev;
                    const updated = {
                        ...prev,
                        installations: { ...prev.installations, installationPath: newPath },
                    };
                    latestPrefsRef.current = updated;
                    return updated;
                });
            } else {
                showError({
                    source: "frontend.preferences.move-installations",
                    userMessage: "Failed to move installations.",
                    code: "MOVE_INSTALLATIONS_FAILED",
                    technicalDetails: result.error ?? "Unknown backend error.",
                });
            }
        } catch (error: unknown) {
            showError({
                source: "frontend.preferences.move-installations",
                userMessage: "Failed to move installations.",
                code: "MOVE_INSTALLATIONS_EXCEPTION",
                technicalDetails: error instanceof Error ? error.toString() : String(error),
            });
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (categoryKey: string, fieldKey: string, value: unknown) => {
        setPreferences((prev) => {
            if (prev === null) return prev;

            const category = prev[categoryKey as keyof Preferences];
            if (typeof category !== "object" || category === null) return prev;

            const updated = {
                ...prev,
                [categoryKey]: {
                    ...(category as unknown as Record<string, unknown>),
                    [fieldKey]: value,
                },
            };

            latestPrefsRef.current = updated;
            persistPreferences(updated);
            return updated;
        });
    };

    const value: PreferencesContextValue = {
        preferences,
        isLoading,
        isSaving,
        updateField,
        moveInstallationPath,
    };

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferencesContext() {
    const context = useContext(PreferencesContext);

    if (context === undefined) {
        throw new Error("usePreferencesContext must be used within a PreferencesContextProvider.");
    }

    return context;
}
