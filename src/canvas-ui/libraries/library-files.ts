import { LibraryDocument, type LibraryAsset } from "@canvas";
import {
  joinRelative,
  projectPaths,
  relativeTo,
  type LibraryEntry,
  type ProjectManifest,
} from "@shared/core";
import { projectFs } from "@platform";

/** A manifest's libraries in the project's order. */
export function sortedLibraries(manifest: ProjectManifest): LibraryEntry[] {
  return [...manifest.libraries].sort((a, b) =>
    a.order < b.order ? -1 : a.order > b.order ? 1 : 0,
  );
}

/** Reads a library's `.clib`. Throws when it's missing or isn't a library. */
export async function readLibrary(root: string, entry: LibraryEntry): Promise<LibraryDocument> {
  return LibraryDocument.fromFile(
    await projectFs.readBytes(projectPaths(root).library(entry.file)),
  );
}

/** Where a library picture's bytes are: `<library>.assets/<id>.<ext>`. */
export function assetFilePath(root: string, entry: LibraryEntry, asset: LibraryAsset): string {
  return joinRelative(projectPaths(root).libraryAssets(entry.file), `${asset.id}.${asset.ext}`);
}

/** Writes a library picture's bytes atomically, making the `.assets/` folder when it's missing. */
export async function writeAssetFile(
  root: string,
  entry: LibraryEntry,
  asset: LibraryAsset,
  bytes: Uint8Array,
): Promise<void> {
  const folder = projectPaths(root).libraryAssets(entry.file);
  if (!(await projectFs.exists(folder)))
    await projectFs.createFolder(root, relativeTo(root, folder));
  await projectFs.writeBytesAtomic(assetFilePath(root, entry, asset), bytes);
}
