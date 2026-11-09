import { CanvasDocument, ElementKinds, heldLibraries, librariesUsedBy } from "@canvas";
import { decodeDesignFile } from "@design";
import { projectFs } from "@platform";
import type { FileInfo, LibraryEntry } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { folderOfFile } from "@pages/shared/files";

/** How many of the newest designs are read to find one using the library. */
const LOOKED_AT = 8;

/** Whether the design at `path` is linked to `projectId` and uses `libraryId` (read from disk). */
async function usesLibrary(
  path: string,
  projectId: string,
  libraryId: string,
  entries: readonly LibraryEntry[],
): Promise<boolean> {
  const update = decodeDesignFile(await projectFs.readBytes(path));
  const doc = CanvasDocument.fromUpdate(new ElementKinds(), update);
  try {
    const link = doc.projectLink();
    return (
      link?.projectId === projectId &&
      librariesUsedBy(link, entries, heldLibraries(doc)).includes(libraryId)
    );
  } finally {
    doc.destroy();
  }
}

/**
 * The most recently edited design of the project in `root` (from the recent files) whose link
 * uses library `libraryId`; `null` when none of the newest does. A file that can't be read is
 * skipped.
 */
export async function designForLibrary(
  root: string,
  projectId: string,
  libraryId: string,
  entries: readonly LibraryEntry[],
): Promise<FileInfo | null> {
  const { files, missing } = useRecentFilesStore.getState();
  const designs = files
    .filter((f) => f.type === "design" && !missing.has(f.id) && folderOfFile(root, f.path) !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, LOOKED_AT);
  for (const design of designs) {
    try {
      if (await usesLibrary(design.path, projectId, libraryId, entries)) return design;
    } catch (error) {
      console.warn(`Couldn't read ${design.path} to look for library ${libraryId}`, error);
    }
  }
  return null;
}
