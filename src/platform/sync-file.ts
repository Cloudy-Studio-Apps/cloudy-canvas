import { invoke, isTauri } from "@tauri-apps/api/core";

/**
 * Waits until a written file is on the disk (and its name in its folder), so a power cut can't lose
 * it. Use it before acting on a file being there, as removing what was copied into it. Nothing to
 * wait for outside the desktop app.
 */
export async function syncFile(path: string): Promise<void> {
  if (isTauri()) await invoke("sync_file", { path });
}
