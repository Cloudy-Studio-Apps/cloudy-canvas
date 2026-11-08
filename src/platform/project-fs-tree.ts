import { copyFile, mkdir, readDir, stat } from "@tauri-apps/plugin-fs";

import { joinRelative } from "@shared/core";

/** The absolute path of `name` inside the absolute folder `dir`, in `dir`'s path style. */
export function childPath(dir: string, name: string): string {
  return joinRelative(dir, name);
}

/** The parent of a `/`-separated relative path (`""` for a top-level item). */
export function parentRel(rel: string): string {
  return rel.split("/").slice(0, -1).join("/");
}

/** The last segment of a `/`-separated relative path. */
export function nameOfRel(rel: string): string {
  return rel.split("/").pop() ?? rel;
}

/** `parent/name`, with `parent` possibly empty. */
export function joinRel(parent: string, name: string): string {
  return parent === "" ? name : `${parent}/${name}`;
}

/** The names in a folder; empty when it doesn't exist. */
export async function namesIn(dir: string): Promise<Set<string>> {
  try {
    return new Set((await readDir(dir)).map((entry) => entry.name));
  } catch {
    return new Set();
  }
}

/** Copies a file, or a folder with everything in it. */
export async function copyTree(from: string, to: string): Promise<void> {
  if (!(await stat(from)).isDirectory) {
    await copyFile(from, to);
    return;
  }
  await mkdir(to, { recursive: true });
  for (const entry of await readDir(from)) {
    await copyTree(childPath(from, entry.name), childPath(to, entry.name));
  }
}

/** Bytes in a file, or in everything inside a folder. */
export async function sizeOfTree(path: string): Promise<number> {
  const info = await stat(path);
  if (!info.isDirectory) return info.size;
  let total = 0;
  for (const entry of await readDir(path)) total += await sizeOfTree(childPath(path, entry.name));
  return total;
}

/** The folder containing `path`, or null at the top. */
export function parentPath(path: string): string | null {
  const parent = path.replace(/[\\/]+[^\\/]*$/, "");
  if (parent === path) return null;
  if (parent === "") return path.startsWith("/") && path !== "/" ? "/" : null;
  return parent;
}
