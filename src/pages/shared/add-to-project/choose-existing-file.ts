import { openCanvasFileDialog } from "@platform";
import { displayName, type FileInfo } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import { t } from "./add-to-project.i18n";

/**
 * Asks for a board or a design to add to a project (Add existing file…) and records it in the
 * recent files. `null` when the user cancels, it can't be read, or it's in a project already
 * (said in a toast).
 */
export async function chooseExistingFile(): Promise<FileInfo | null> {
  try {
    const path = await openCanvasFileDialog();
    if (!path) return null;
    const file = await useRecentFilesStore.getState().open(path);
    if (file.projectId) {
      toast({ title: t("inProject", { name: displayName(file) }) });
      return null;
    }
    return file;
  } catch (error) {
    notifyError(t("failed.open"), error);
    return null;
  }
}
