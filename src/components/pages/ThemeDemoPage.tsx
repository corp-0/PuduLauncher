import ThemeDemo from "../molecules/themeDemo/ThemeDemo";
import {BackendConnectionChecker} from "../../contextProviders/BackendConnectionChecker.tsx";

export default function ThemeDemoPage() {
    return (
        <BackendConnectionChecker>
            <ThemeDemo />
        </BackendConnectionChecker>
    )
}