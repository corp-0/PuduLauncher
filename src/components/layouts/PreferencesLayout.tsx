import { Box, CircularProgress, Stack, Typography } from "@mui/joy";
import { preferencesSchema } from "../../pudu/generated";
import { usePreferencesContext } from "../../contextProviders/PreferencesContextProvider";
import PreferenceCategory from "../molecules/preferences/PreferenceCategory";

export default function PreferencesLayout() {
    const { preferences, isLoading, isSaving, updateField, moveInstallationPath } = usePreferencesContext();

    const installationsFieldOverrides: Record<string, (value: unknown) => void | Promise<void>> = {
        installationPath: (value) => moveInstallationPath(value as string),
    };

    return (
        <Box sx={{ height: "100%", minWidth: 0, display: "flex", flexDirection: "column" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 3, pb: 2 }}>
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
                        fieldOverrides={category.key === "installations" ? installationsFieldOverrides : undefined}
                    />
                ))}
            </Stack>
        </Box>
    );
}
