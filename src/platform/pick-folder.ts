import { isTauri } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

/** Asks for a folder on this device; its path, `null` when cancelled (or in a browser). */
export async function pickFolder(title: string): Promise<string | null> {
  if (!isTauri()) return null;
  const picked = await open({ directory: true, multiple: false, title });
  return typeof picked === "string" ? picked : null;
}
