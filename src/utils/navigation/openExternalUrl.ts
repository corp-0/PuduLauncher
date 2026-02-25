import { openUrl } from "@tauri-apps/plugin-opener";
import type { MouseEvent } from "react";

export async function openExternalUrl(event: MouseEvent<HTMLAnchorElement>, url: string) {
    event.preventDefault();

    try {
        await openUrl(url);
    } catch {
        window.open(url, "_blank", "noopener,noreferrer");
    }
}
