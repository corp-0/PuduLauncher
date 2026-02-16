import { Box, CircularProgress, Stack, Typography } from "@mui/joy";
import { preferencesSchema } from "../../pudu/generated";
import { usePreferencesContext } from "../../contextProviders/PreferencesContextProvider";
import { themeIdToPreferenceValue, themePreferenceValueToThemeId, useThemeContext } from "../../contextProviders/ThemeProvider";
import PreferenceCategory from "../molecules/preferences/PreferenceCategory";

export default function PreferencesLayout() {
    const { preferences, isLoading, isSaving, updateField, moveInstallationPath } = usePreferencesContext();
    const { changeThemeId } = useThemeContext();

    const fieldOverridesByCategory: Record<string, Record<string, (value: unknown) => void | Promise<void>>> = {
        launcher: {
            theme: (value) => {
                const themeId = themePreferenceValueToThemeId(value);
                if (themeId) {
                    changeThemeId(themeId);
                    updateField("launcher", "theme", themeIdToPreferenceValue(themeId));
                    return;
                }

                if (typeof value === "string") {
                    updateField("launcher", "theme", value);
                }
            },
        },
        installations: {
            installationPath: (value) => moveInstallationPath(value as string),
        },
    };

    return (
        <Box sx={{ height: "100%", minWidth: 0, display: "flex", flexDirection: "column" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 3, pb: 2, }}>
                <Stack spacing={0.5}>
                    <Typography level="h1">
                        Preferences
                    </Typography>
                    <Typography level="body-sm" sx={{ color: "text.secondary" }}>
                        {isSaving ? "Saving..." : "Changes are saved automatically"}
                    </Typography>
                </Stack>
            </Stack>

            <Stack spacing={2} sx={{ px: 3, pb: 3, minHeight: 0, overflowY: "auto" }}>
                {isLoading && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 4, justifyContent: "center" }}>
                        <CircularProgress size="sm" />
                        <Typography level="body-sm">Loading preferences...</Typography>
                    </Stack>
                )}

                {preferences && preferencesSchema.map((category) => (
                    <PreferenceCategory
                        key={category.key}
                        schema={category}
                        preferences={preferences}
                        updateField={updateField}
                        fieldOverrides={fieldOverridesByCategory[category.key]}
                    />
                ))}
            </Stack>
        </Box>
    );
}
