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

/** `path` relative to `root`, `/`-separated. Throws when `path` is not inside `root`. */
export function relativeTo(root: string, path: string): string {
  const windows = separatorOf(root) === "\\" || /^[a-z]:/i.test(root);
  const norm = (value: string) => trimEnd(value.replace(/\\/g, "/"));
  const base = norm(root);
  const full = norm(path);
  const same = (a: string, b: string) => (windows ? a.toLowerCase() === b.toLowerCase() : a === b);
  if (same(full, base)) return "";
  if (!same(full.slice(0, base.length + 1), `${base}/`)) {
    throw new Error(`"${path}" is not inside "${root}"`);
  }
  return full.slice(base.length + 1);
}

/** The absolute path of `rel` (`/`-separated) under `root`, in the root's style. */
export function joinRelative(root: string, rel: string): string {
  return join(root, rel);
}
