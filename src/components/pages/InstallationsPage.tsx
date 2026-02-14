import { InstallationsContextProvider } from "../../contextProviders/InstallationsContextProvider";
import InstallationsLayout from "../layouts/InstallationsLayout";


export default function InstallationsPage() {
    return (
        <InstallationsContextProvider>
            <InstallationsLayout />
        </InstallationsContextProvider>
    );
}
