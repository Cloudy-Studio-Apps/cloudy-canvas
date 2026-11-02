import { isTauri } from "@tauri-apps/api/core";

import { isAndroidPlatform, type AppUpdater } from "@shared/core";
import { TauriAppUpdater } from "./tauri-app-updater";

/**
 * Updates of the desktop app; `null` where the app doesn't update itself (browser dev, web, and
 * Android, where the store does).
 */
export const appUpdater: AppUpdater | null =
  isTauri() && !isAndroidPlatform() ? new TauriAppUpdater() : null;
