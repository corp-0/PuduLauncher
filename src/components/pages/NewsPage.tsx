import NewsLayout from "../layouts/NewsLayout.tsx";
import { NewsContextProvider } from "../../contextProviders/NewsContextProvider";

export default function NewsPage() {
    return (
        <NewsContextProvider>
            <NewsLayout />
        </NewsContextProvider>
    );
}
