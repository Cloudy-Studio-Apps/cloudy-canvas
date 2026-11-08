import { writeFile } from "@tauri-apps/plugin-fs";

import { renameWithRetry } from "./rename-with-retry";

/** The write running for each path, so writes to one path happen one after another. */
const running = new Map<string, Promise<void>>();

/**
 * Writes beside the file and swaps it in, so a failed save never leaves half a file. Writes to the
 * same path queue up: two never share the temporary file.
 */
export function writeAtomic(path: string, data: Uint8Array): Promise<void> {
  const previous = running.get(path) ?? Promise.resolve();
  const run = previous
    .catch(() => undefined)
    .then(async () => {
      await writeFile(`${path}.tmp`, data);
      await renameWithRetry(`${path}.tmp`, path);
    });
  const tail = run.catch(() => undefined);
  running.set(path, tail);
  void tail.then(() => {
    if (running.get(path) === tail) running.delete(path);
  });
  return run;
}
