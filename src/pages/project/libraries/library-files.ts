import { createLibraryFile } from "@canvas";
import { projectFs } from "@platform";
import {
  LIBRARIES_DIR,
  PROJECT_DATA_DIR,
  projectPaths,
  relativeTo,
  uniqueName,
  type LibraryEntry,
  type ProjectManifest,
} from "@shared/core";

/** The last segment of a path of either style. */
function lastSegment(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

/** A library's file and `.assets` folder relative to the project (`/`-separated). */
export function libraryRels(root: string, file: string): { file: string; assets: string } {
  const paths = projectPaths(root);
  return {
    file: relativeTo(root, paths.library(file)),
    assets: relativeTo(root, paths.libraryAssets(file)),
  };
}

/** Writes a new empty library for the manifest `libraries` and returns its entry. */
export function newLibraryEntry(
  root: string,
  name: string,
  autoAdd: boolean,
): Promise<LibraryEntry> {
  return createLibraryFile(projectFs, root, name).then((entry) => ({ ...entry, autoAdd }));
}

/** The file name for a library renamed to `name`: `<name>.clib`, or a numbered one no other library has. */
export function renamedLibraryFile(
  manifest: ProjectManifest,
  entry: LibraryEntry,
  name: string,
): string {
  const taken = new Set(manifest.libraries.filter((l) => l.id !== entry.id).map((l) => l.file));
  return uniqueName(`${name.trim()}.clib`, taken);
}

const stemOf = (file: string) => file.replace(/\.clib$/i, "");

/**
 * Renames a library's `.clib` and `.assets` folder on disk from the file name `from` to `wanted`
 * and returns the name the file got. If the folder can't follow, the `.clib` goes back and this
 * throws. The manifest and the hub are the caller's.
 */
export async function moveLibraryFiles(
  root: string,
  from: string,
  wanted: string,
): Promise<string> {
  const rels = libraryRels(root, from);
  const hadAssets = await projectFs.exists(projectPaths(root).libraryAssets(from));
  const moved = lastSegment(await projectFs.rename(root, rels.file, wanted));
  if (hadAssets) {
    try {
      await projectFs.rename(root, rels.assets, `${stemOf(moved)}.assets`);
    } catch (error) {
      await projectFs.rename(root, libraryRels(root, moved).file, from);
      throw error;
    }
  }
  return moved;
}

const LIBRARIES_REL = `${PROJECT_DATA_DIR}/${LIBRARIES_DIR}`;

/** A library file or folder in the data folder: its stem and kind, or `null` for any other path. */
function libraryItemOf(rel: string): { stem: string; ext: "clib" | "assets" } | null {
  if (!rel.toLowerCase().startsWith(`${LIBRARIES_REL}/`)) return null;
  const match = /^([^/]+)\.(clib|assets)$/i.exec(rel.slice(LIBRARIES_REL.length + 1));
  return match ? { stem: match[1] ?? "", ext: match[2]?.toLowerCase() as "clib" | "assets" } : null;
}

/**
 * A library file or folder was restored from the trash to `rel` (it was at `from`): restores the
 * other half of the pair from the trash too, and gives both the `.clib`'s stem. Returns the
 * `.clib`'s file name, or `null` when `rel` isn't a library item or the `.clib` isn't back.
 */
export async function restoreLibraryPair(
  root: string,
  rel: string,
  from: string,
): Promise<string | null> {
  const item = libraryItemOf(rel);
  const origin = libraryItemOf(from);
  if (!item || !origin) return null;
  let clib = item.ext === "clib" ? item.stem : null;
  let assets = item.ext === "assets" ? item.stem : null;
  const otherExt = item.ext === "clib" ? "assets" : "clib";
  const other = (await projectFs.listTrash(root)).find(
    (e) => e.from.toLowerCase() === `${LIBRARIES_REL}/${origin.stem}.${otherExt}`.toLowerCase(),
  );
  if (other) {
    const back = libraryItemOf(await projectFs.restore(root, other.id));
    if (back?.ext === "clib") clib = back.stem;
    else if (back) assets = back.stem;
  }
  if (clib === null) return null;
  if (assets !== null && assets !== clib) {
    const free = !(await projectFs.exists(projectPaths(root).libraryAssets(`${clib}.clib`)));
    if (free) await projectFs.rename(root, `${LIBRARIES_REL}/${assets}.assets`, `${clib}.assets`);
  }
  return `${clib}.clib`;
}

/** Moves a library's `.clib` and `.assets` folder to the project's trash. */
export async function trashLibraryFiles(root: string, entry: LibraryEntry): Promise<void> {
  const rels = libraryRels(root, entry.file);
  await projectFs.toTrash(root, rels.file);
  if (await projectFs.exists(projectPaths(root).libraryAssets(entry.file))) {
    await projectFs.toTrash(root, rels.assets);
  }
}
