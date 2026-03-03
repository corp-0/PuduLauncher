import type { ComponentType } from "react";
import type { CategoryLayout, Preferences } from "../../../pudu/generated";
import { TtsPreferencesContextProvider } from "../../../contextProviders/TtsPreferencesContextProvider";
import TtsPreferencesLayout from "./customLayouts/TtsPreferencesLayout";

export interface CustomLayoutProps {
    categoryKey: string;
    preferences: Preferences;
    updateField: (categoryKey: string, fieldKey: string, value: unknown) => void;
}

function TtsPreferencesLayoutWithProvider(props: CustomLayoutProps) {
    return (
        <TtsPreferencesContextProvider>
            <TtsPreferencesLayout {...props} />
        </TtsPreferencesContextProvider>
    );
}

export const customLayouts: Record<CategoryLayout, ComponentType<CustomLayoutProps>> = {
    TtsPreferencesLayout: TtsPreferencesLayoutWithProvider,
};
