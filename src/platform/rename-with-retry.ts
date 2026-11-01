import { remove, rename } from "@tauri-apps/plugin-fs";

/** The waits between tries (ms): antivirus and sync apps hold a new file for a moment. */
const RETRY_DELAYS_MS = [50, 100, 200, 400];

/**
 * Renames a temporary file over its target, trying again while another program holds either. If
 * it never works the target stays as it was and the temporary file goes.
 */
export async function renameWithRetry(from: string, to: string): Promise<void> {
  for (const delay of RETRY_DELAYS_MS) {
    try {
      await rename(from, to);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  try {
    await rename(from, to);
  } catch (error) {
    await remove(from).catch(() => undefined);
    throw error;
  }
}
