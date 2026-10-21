import { isTauri } from "@tauri-apps/api/core";

import type { Clipboard } from "@shared/core";
import { BrowserClipboard } from "./browser-clipboard";
import { TauriClipboard } from "./tauri-clipboard";

/** The system clipboard for the current platform. */
export const clipboard: Clipboard = isTauri() ? new TauriClipboard() : new BrowserClipboard();
