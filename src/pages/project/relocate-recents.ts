import { storage } from "@platform";
import { isPathInside, joinRelative, relativeTo } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";

/**
 * After `fromRel` (a file, or a folder with files in it) moved to `toRel` inside the project at
 * `root`, points the recent files that lived there at their new paths, so Home still finds them.
 * Windows-style paths are matched ignoring case.
 */
export async function relocateRecents(root: string, fromRel: string, toRel: string): Promise<void> {
  const from = joinRelative(root, fromRel);
  const affected = useRecentFilesStore
    .getState()
    .files.filter((file) => isPathInside(from, file.path));
  if (affected.length === 0) return;
  for (const file of affected) {
    const inner = relativeTo(from, file.path);
    await storage.relocate(file.id, joinRelative(root, inner === "" ? toRel : `${toRel}/${inner}`));
  }
  await useRecentFilesStore.getState().refresh();
}
