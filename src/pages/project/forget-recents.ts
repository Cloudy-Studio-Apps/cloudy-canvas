import { joinRelative } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { isInside, normalizePath } from "./project-rel";

/** After `rel` (a file, or a folder with files in it) left the project, drops its recent files. */
export async function forgetRecents(root: string, rel: string): Promise<void> {
  const gone = normalizePath(joinRelative(root, rel));
  const store = useRecentFilesStore.getState();
  const affected = store.files.filter((file) => isInside(gone, normalizePath(file.path)));
  for (const file of affected) await store.forget(file.id);
}
