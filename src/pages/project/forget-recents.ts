import { isPathInside, joinRelative } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";

/**
 * After `rel` (a file, or a folder with files in it) left the project, drops its recent files
 * (Windows-style paths matched ignoring case).
 */
export async function forgetRecents(root: string, rel: string): Promise<void> {
  const gone = joinRelative(root, rel);
  const store = useRecentFilesStore.getState();
  const affected = store.files.filter((file) => isPathInside(gone, file.path));
  for (const file of affected) await store.forget(file.id);
}
