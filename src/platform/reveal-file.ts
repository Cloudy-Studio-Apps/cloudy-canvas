import { isTauri } from "@tauri-apps/api/core";
import { revealItemInDir } from "@tauri-apps/plugin-opener";

/** Shows the file in the system file manager (Explorer, Files, …), selected. */
export async function revealFile(path: string): Promise<void> {
  if (!isTauri()) throw new Error("Showing files in their folder needs the desktop app.");
  await revealItemInDir(path);
}
