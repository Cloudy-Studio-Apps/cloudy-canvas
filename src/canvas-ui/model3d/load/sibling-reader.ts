import { readLocalFile } from "@platform";
import type { SiblingReader } from "./import-model.types";
import { isSafeRelative } from "./sibling-paths";

/**
 * A reader for files next to the model on disk (desktop), or `null` when the model has no path.
 * Any failure (missing file, no permission) answers `null`.
 */
export function siblingReader(path: string | null): SiblingReader | null {
  if (!path) return null;
  const cut = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  const folder = path.slice(0, cut + 1);
  const separator = path.includes("\\") && !path.includes("/") ? "\\" : "/";
  return async (name) => {
    // Only a plain relative path below the model's folder (see `siblingPaths`).
    if (!isSafeRelative(name)) return null;
    try {
      const relative = name.replace(/[\\/]/g, separator);
      return await readLocalFile(folder + relative);
    } catch {
      return null;
    }
  };
}
