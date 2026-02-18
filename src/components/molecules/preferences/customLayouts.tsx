import type { ComponentType } from "react";
import type { CategoryLayout, Preferences } from "../../../pudu/generated";
import TtsPreferencesLayout from "./customLayouts/TtsPreferencesLayout";

export interface CustomLayoutProps {
    categoryKey: string;
    preferences: Preferences;
    updateField: (categoryKey: string, fieldKey: string, value: unknown) => void;
}

export const customLayouts: Record<CategoryLayout, ComponentType<CustomLayoutProps>> = {
    TtsPreferencesLayout,
};
