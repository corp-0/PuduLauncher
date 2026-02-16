import { PreferencesContextProvider } from "../../contextProviders/PreferencesContextProvider";
import PreferencesLayout from "../layouts/PreferencesLayout";

export default function PreferencesPage() {
    return (
        <PreferencesContextProvider>
            <PreferencesLayout />
        </PreferencesContextProvider>
    );
}
