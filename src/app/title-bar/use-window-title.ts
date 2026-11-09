import { useEffect } from "react";

import { useFileTabs } from "@canvas-ui";
import { windowChrome } from "@platform";

const APP_NAME = "Cloudy Canvas";

/** The window's title: "<active tab name> — Cloudy Canvas", or just the app's on Home. */
export function useWindowTitle(): void {
  const name = useFileTabs((s) => s.tabs.find((tab) => tab.id === s.activeId)?.name ?? null);
  useEffect(() => {
    const title = name ? `${name} — ${APP_NAME}` : APP_NAME;
    document.title = title;
    windowChrome?.setTitle(title);
  }, [name]);
}
