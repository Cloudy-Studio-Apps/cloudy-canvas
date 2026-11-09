import { isTauri } from "@tauri-apps/api/core";

import { isAndroidPlatform } from "@shared/core";

/** Whether file tabs and the custom title bar exist here: the desktop app only. */
export function tabsSupported(): boolean {
  return isTauri() && !isAndroidPlatform();
}
