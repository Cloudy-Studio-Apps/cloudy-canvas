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

/**
 * Renames a library's `.clib` and `.assets` folder on disk to `name` and returns the new file
 * name (one no other library has). The manifest is the caller's.
 */
export async function renameLibraryFiles(
  root: string,
  manifest: ProjectManifest,
  entry: LibraryEntry,
  name: string,
): Promise<string> {
  const taken = new Set(manifest.libraries.filter((l) => l.id !== entry.id).map((l) => l.file));
  const wanted = uniqueName(`${name.trim()}.clib`, taken);
  const from = libraryRels(root, entry.file);
  const hadAssets = await projectFs.exists(projectPaths(root).libraryAssets(entry.file));
  const moved = lastSegment(await projectFs.rename(root, from.file, wanted));
  if (hadAssets) {
    await projectFs.rename(root, from.assets, `${moved.replace(/\.clib$/i, "")}.assets`);
  }
  return moved;
}

/** Puts a library's files renamed to `moved` back under their `original` file name. */
export async function revertLibraryRename(
  root: string,
  moved: string,
  original: string,
): Promise<void> {
  const to = libraryRels(root, moved);
  await projectFs.rename(root, to.file, original);
  if (await projectFs.exists(projectPaths(root).libraryAssets(moved))) {
    await projectFs.rename(root, to.assets, `${original.replace(/\.clib$/i, "")}.assets`);
  }
}

/**
 * After a `.clib` came back from the trash as `file` (it was `from`, a name that was taken), its
 * `.assets` folder, if it came back earlier under the old stem, takes the new one.
 */
export async function matchRestoredAssets(root: string, file: string, from: string): Promise<void> {
  const stem = (name: string) => name.replace(/\.clib$/i, "");
  const old = stem(lastSegment(from));
  if (old === stem(file)) return;
  const paths = projectPaths(root);
  const oldFolder = paths.libraryAssets(`${old}.clib`);
  if ((await projectFs.exists(oldFolder)) && !(await projectFs.exists(paths.libraryAssets(file)))) {
    await projectFs.rename(root, libraryRels(root, `${old}.clib`).assets, `${stem(file)}.assets`);
  }
}

/** Moves a library's `.clib` and `.assets` folder to the project's trash. */
export async function trashLibraryFiles(root: string, entry: LibraryEntry): Promise<void> {
  const rels = libraryRels(root, entry.file);
  await projectFs.toTrash(root, rels.file);
  if (await projectFs.exists(projectPaths(root).libraryAssets(entry.file))) {
    await projectFs.toTrash(root, rels.assets);
  }
}

/** Whether `rel` is a library's `.clib` inside the data folder (a restored one). */
export function isLibraryRel(rel: string): boolean {
  const folder = `${PROJECT_DATA_DIR}/${LIBRARIES_DIR}/`;
  return rel.toLowerCase().startsWith(folder) && /^[^/]+\.clib$/i.test(rel.slice(folder.length));
}
