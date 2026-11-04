import { isTauri } from "@tauri-apps/api/core";
import { appDataDir, normalize } from "@tauri-apps/api/path";

/** A path to compare: one separator kind, lower-case (Windows and macOS ignore case), no end slash. */
function comparable(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
}

/**
 * Whether a path is inside the app's data folder (secrets, drafts, plugins): files there are the
 * app's own and are never read on a document's behalf. Always `false` outside the desktop app.
 */
export async function isAppDataPath(path: string): Promise<boolean> {
  if (!isTauri()) return false;
  const [dir, target] = await Promise.all([appDataDir(), normalize(path)]);
  const base = comparable(dir);
  const file = comparable(target);
  return file === base || file.startsWith(`${base}/`);
}
