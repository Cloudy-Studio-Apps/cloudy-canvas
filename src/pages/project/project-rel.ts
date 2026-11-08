import { isReservedName, type FolderStyle } from "@shared/core";
import { t } from "./project.i18n";

/** The folder holding `rel` (`""` for the project root). */
export function parentRel(rel: string): string {
  const cut = rel.lastIndexOf("/");
  return cut < 0 ? "" : rel.slice(0, cut);
}

/** The last segment of `rel`. */
export function nameOfRel(rel: string): string {
  return rel.slice(rel.lastIndexOf("/") + 1);
}

/** `name` inside the folder `folder`. */
export function joinRel(folder: string, name: string): string {
  return folder === "" ? name : `${folder}/${name}`;
}

/** Whether `rel` is `folder` itself or inside it. */
export function isInside(folder: string, rel: string): boolean {
  return rel === folder || rel.startsWith(`${folder}/`);
}

/** `path` with `/` separators and no trailing one, for comparing paths of either style. */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+$/, "");
}

/** The folder styles with the keys of `from` (and the folders inside it) moved to `to`. */
export function rekeyFolders(
  folders: Record<string, FolderStyle>,
  from: string,
  to: string,
): Record<string, FolderStyle> {
  const next: Record<string, FolderStyle> = {};
  for (const [rel, style] of Object.entries(folders)) {
    next[isInside(from, rel) ? to + rel.slice(from.length) : rel] = style;
  }
  return next;
}

/** The reason `name` can't be a file or folder name, or null. */
export function renameError(name: string): string | null {
  return isReservedName(name.trim()) ? t("rename.invalid") : null;
}
