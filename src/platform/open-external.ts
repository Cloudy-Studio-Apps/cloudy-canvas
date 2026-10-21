import { isTauri } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";

/** Opens a web page in the user's browser. Allowed URLs are listed in the desktop capabilities. */
export async function openExternal(url: string): Promise<void> {
  if (isTauri()) return openUrl(url);
  window.open(url, "_blank", "noopener");
}
