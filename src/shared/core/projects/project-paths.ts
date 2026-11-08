import {
  LIBRARIES_DIR,
  LIBRARY_EXTENSION,
  PROJECT_DATA_DIR,
  PROJECT_EXTENSION,
  TRASH_DIR,
} from "./project-manifest";
import type { ProjectPaths } from "./project-paths.types";

/** The separator a path uses: `\` only for a Windows-style path (no `/` in it). */
function separatorOf(path: string): "/" | "\\" {
  return path.includes("\\") && !path.includes("/") ? "\\" : "/";
}

function trimEnd(path: string): string {
  return path.replace(/[\\/]+$/, "");
}

/** Joins `parts` (segments, each possibly `/`-separated) to `root` in the root's style. */
function join(root: string, ...parts: string[]): string {
  const sep = separatorOf(root);
  const rest = parts.flatMap((part) => part.split(/[\\/]+/)).filter((segment) => segment !== "");
  return [trimEnd(root), ...rest].join(sep);
}

/** Where a project keeps its things on disk, in `root`'s path style. */
export function projectPaths(root: string): ProjectPaths {
  const libraries = join(root, PROJECT_DATA_DIR, LIBRARIES_DIR);
  const trash = join(root, PROJECT_DATA_DIR, TRASH_DIR);
  const stem = (file: string) => file.replace(new RegExp(`\\.${LIBRARY_EXTENSION}$`, "i"), "");
  return {
    manifest: (name) => join(root, `${name}.${PROJECT_EXTENSION}`),
    data: join(root, PROJECT_DATA_DIR),
    libraries,
    library: (file) => join(libraries, file),
    libraryAssets: (file) => join(libraries, `${stem(file)}.assets`),
    trash,
    trashIndex: join(trash, "index.json"),
  };
}

/** Whether `path` names a project's `.cproject` file. */
export function isProjectFilePath(path: string): boolean {
  return path.toLowerCase().endsWith(`.${PROJECT_EXTENSION}`);
}

/** The folder holding `path`, in its own style; `""` when it has no folder part. */
export function parentFolder(path: string): string {
  const cut = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return cut > 0 ? path.slice(0, cut) : "";
}

/** Whether `path` is Windows-style (a `\` separator or a drive letter): compared ignoring case. */
function isWindowsPath(path: string): boolean {
  return separatorOf(path) === "\\" || /^[a-z]:/i.test(path);
}

/** `path` with `/` separators and no trailing one. */
function normalized(path: string): string {
  return trimEnd(path.replace(/\\/g, "/"));
}

/**
 * The rest of `path` after `folder` (`""` for the folder itself, else starting with `/`), or
 * `null` when `path` isn't inside it. Separators of either style; case-insensitive for
 * Windows-style paths.
 */
function restAfter(folder: string, path: string): string | null {
  const windows = isWindowsPath(folder) || isWindowsPath(path);
  const base = normalized(folder);
  const full = normalized(path);
  const same = (a: string, b: string) => (windows ? a.toLowerCase() === b.toLowerCase() : a === b);
  if (same(full, base)) return "";
  if (!same(full.slice(0, base.length + 1), `${base}/`)) return null;
  return full.slice(base.length);
}

/** Whether two absolute paths name the same place (Windows-style ones ignoring case). */
export function samePath(a: string, b: string): boolean {
  return restAfter(a, b) === "";
}

/** Whether `path` is `folder` itself or inside it (Windows-style paths ignoring case). */
export function isPathInside(folder: string, path: string): boolean {
  return restAfter(folder, path) !== null;
}

/** `path` relative to `root`, `/`-separated. Throws when `path` is not inside `root`. */
export function relativeTo(root: string, path: string): string {
  const rest = restAfter(root, path);
  if (rest === null) throw new Error(`"${path}" is not inside "${root}"`);
  return rest.slice(1);
}

/** The absolute path of `rel` (`/`-separated) under `root`, in the root's style. */
export function joinRelative(root: string, rel: string): string {
  return join(root, rel);
}
