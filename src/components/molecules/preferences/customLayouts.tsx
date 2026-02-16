import type {ComponentType} from "react";
import {Typography} from "@mui/joy";
import type {CategoryLayout, Preferences} from "../../../pudu/generated";

export interface CustomLayoutProps {
    categoryKey: string;
    preferences: Preferences;
    updateField: (categoryKey: string, fieldKey: string, value: unknown) => void;
}

function TtsPreferencesLayout(props: CustomLayoutProps) {
    const stringProps = JSON.stringify(props);

    return (
        <Typography level="body-sm" sx={{color: "text.tertiary", fontStyle: "italic"}}>
            TTS preferences will be available here.
            {stringProps}
        </Typography>
    );
}

export const customLayouts: Record<CategoryLayout, ComponentType<CustomLayoutProps>> = {
    TtsPreferencesLayout,
};
