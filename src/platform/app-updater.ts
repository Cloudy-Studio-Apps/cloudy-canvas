import { isTauri } from "@tauri-apps/api/core";

import type { AppUpdater } from "@shared/core";
import { TauriAppUpdater } from "./tauri-app-updater";

/** Updates of the desktop app; `null` where the app doesn't update itself (browser dev, web). */
export const appUpdater: AppUpdater | null = isTauri() ? new TauriAppUpdater() : null;
