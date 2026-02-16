import { Card, Stack, Typography } from "@mui/joy";
import type { PreferenceCategorySchema, Preferences } from "../../../pudu/generated";
import PreferenceField from "./PreferenceField";
import { customLayouts } from "./customLayouts";

interface PreferenceCategoryProps {
    schema: PreferenceCategorySchema;
    preferences: Preferences;
    updateField: (categoryKey: string, fieldKey: string, value: unknown) => void;
    fieldOverrides?: Record<string, (value: unknown) => void | Promise<void>>;
}

export default function PreferenceCategory(props: PreferenceCategoryProps) {
    const { schema, preferences, updateField, fieldOverrides } = props;
    const categoryData = preferences[schema.key as keyof Preferences];

    const renderFields = () => {
        if (schema.layout) {
            const CustomLayout = customLayouts[schema.layout];
            if (CustomLayout) {
                return (
                    <CustomLayout
                        categoryKey={schema.key}
                        preferences={preferences}
                        updateField={updateField}
                    />
                );
            }
        }

        if (schema.fields.length === 0) {
            return null;
        }

        return (
            <Stack spacing={2}>
                {schema.fields.map((field) => {
                    const value = typeof categoryData === "object" && categoryData !== null
                        ? (categoryData as unknown as Record<string, unknown>)[field.key]
                        : undefined;

                    return (
                        <PreferenceField
                            key={field.key}
                            schema={field}
                            value={value}
                            onChange={fieldOverrides?.[field.key] ?? ((newValue) => updateField(schema.key, field.key, newValue))}
                        />
                    );
                })}
            </Stack>
        );
    };

    return (
        <Card variant="outlined">
            <Typography level="title-lg" sx={{ mb: 1 }}>
                {schema.label}
            </Typography>
            {renderFields()}
        </Card>
    );
}
