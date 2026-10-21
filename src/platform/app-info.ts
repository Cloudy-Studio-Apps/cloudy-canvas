import { getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { isTauri } from "@tauri-apps/api/core";

import type { AppInfo } from "@shared/core";

/** The running app's version and build. Outside Tauri the version comes from `package.json`. */
export async function appInfo(): Promise<AppInfo> {
  const build = import.meta.env.DEV ? "development" : "production";
  if (!isTauri()) return { version: __APP_VERSION__, tauriVersion: null, build };
  const [version, tauriVersion] = await Promise.all([getVersion(), getTauriVersion()]);
  return { version, tauriVersion, build };
}
