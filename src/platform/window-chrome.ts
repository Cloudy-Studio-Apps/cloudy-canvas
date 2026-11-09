import type { WindowChrome } from "@shared/core";
import { tabsSupported } from "./tabs-support";
import { TauriWindowChrome } from "./tauri-window-chrome";

/** The window's own controls for the custom title bar; `null` outside the desktop app. */
export const windowChrome: WindowChrome | null = tabsSupported() ? new TauriWindowChrome() : null;
