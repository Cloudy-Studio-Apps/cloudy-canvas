import { mkdir, readDir, readFile, writeFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

/** Copies a folder and everything in it (symbolic links are skipped). */
export async function copyFolder(from: string, to: string): Promise<void> {
  await mkdir(to, { recursive: true });
  for (const entry of await readDir(from)) {
    if (entry.isSymlink) continue;
    const source = await join(from, entry.name);
    const target = await join(to, entry.name);
    if (entry.isDirectory) await copyFolder(source, target);
    else if (entry.isFile) await writeFile(target, await readFile(source));
  }
}
