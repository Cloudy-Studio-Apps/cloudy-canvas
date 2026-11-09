import { tabHandles } from "@canvas-ui/tabs/tab-handles";
import { fileTabs } from "./file-tabs-instance";
import { stopDocumentAutosave } from "./hosted-tabs";

/**
 * Closes a file tab where tabs aren't supported (Android: one file at a time), as leaving its
 * editor did before tabs: the editor's closing work (the engine's last writes, the sweep, the
 * pending autosave) runs while it's still mounted and the document still there, and only then the
 * tab closes and its document goes. Nothing is asked: Android keeps each file's own close guard,
 * and the close-tab question isn't mounted there.
 */
export async function leaveFile(id: string): Promise<void> {
  await tabHandles
    .get(id)
    ?.finish()
    .catch(() => undefined);
  stopDocumentAutosave(id);
  fileTabs.close(id);
}
