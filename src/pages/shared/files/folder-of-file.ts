import { relativeTo } from "@shared/core";

/** The folder a file sits in, relative to the project at `root`; `null` when it is outside it. */
export function folderOfFile(root: string, path: string): string | null {
  try {
    const rel = relativeTo(root, path);
    const cut = rel.lastIndexOf("/");
    return cut < 0 ? "" : rel.slice(0, cut);
  } catch {
    return null;
  }
}
