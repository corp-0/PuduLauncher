import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

let devtoolsWindow: WebviewWindow | null = null;

export async function openDevToolsWindow(): Promise<void> {
  // Check if already open
  if (devtoolsWindow) {
    try {
      await devtoolsWindow.setFocus();
      return;
    } catch {
      devtoolsWindow = null;
    }
  }

  devtoolsWindow = new WebviewWindow("pudu-devtools", {
    url: "/devtools",
    title: "PuduLauncher DevTools",
    width: 900,
    height: 600,
  });

  devtoolsWindow.once("tauri://destroyed", () => {
    devtoolsWindow = null;
  });
}
