import { isTauri } from "@tauri-apps/api/core";

import { isAndroidPlatform } from "@shared/core";

/** Whether projects exist here: the desktop app only, not Android and not the browser build. */
export function projectsSupported(): boolean {
  return isTauri() && !isAndroidPlatform();
}
