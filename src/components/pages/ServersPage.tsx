import ServersLayout from "../layouts/ServersLayout";
import { ServersContextProvider } from "../../contextProviders/ServersContextProvider";

export default function ServersPage() {
    return (
        <ServersContextProvider>
            <ServersLayout />
        </ServersContextProvider>
    )
}
