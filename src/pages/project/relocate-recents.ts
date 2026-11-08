import { storage } from "@platform";
import { joinRelative } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { isInside, normalizePath } from "./project-rel";

/**
 * After `fromRel` (a file, or a folder with files in it) moved to `toRel` inside the project at
 * `root`, points the recent files that lived there at their new paths, so Home still finds them.
 */
export async function relocateRecents(root: string, fromRel: string, toRel: string): Promise<void> {
  const from = normalizePath(joinRelative(root, fromRel));
  const affected = useRecentFilesStore
    .getState()
    .files.filter((file) => isInside(from, normalizePath(file.path)));
  if (affected.length === 0) return;
  for (const file of affected) {
    const inner = normalizePath(file.path).slice(from.length);
    await storage.relocate(file.id, joinRelative(root, toRel + inner));
  }
  await useRecentFilesStore.getState().refresh();
}
