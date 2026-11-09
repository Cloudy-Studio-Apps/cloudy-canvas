import { tabHandles } from "@canvas-ui/tabs/tab-handles";
import type { TabHandle } from "@canvas-ui/tabs/tab-handles.types";
import { notifyError } from "@shared/stores/toast-store";
import { askToCloseTab } from "./close-tab-prompt";
import { fileTabs } from "./file-tabs-instance";
import { stopDocumentAutosave } from "./hosted-tabs";
import { t } from "./tabs.i18n";

/** Tabs being closed, so a second click doesn't ask twice. */
const closing = new Set<string>();

/**
 * Closes a file tab without losing its changes. Changes nothing will save (autosave off or
 * failing) ask first: Save · Don't save · Cancel. Otherwise the editor's closing work and pending
 * autosave run while the document is still there; then the preview is taken and the tab closes
 * (`FileTabs.close`: a joined live session is left, and the agents bound to the tab go with it).
 * A hosted file's session ends with its tab, and the guests' last edits are saved. A tab with no
 * editor mounted (hibernated, or a live guest) has nothing to save and just closes, except a hosted
 * one's pending autosave.
 */
export async function closeTab(id: string): Promise<void> {
  const tab = fileTabs.get(id);
  if (closing.has(id) || !tab) return;
  closing.add(id);
  try {
    const handle = tabHandles.get(id);
    if (handle && !(await settle(id, handle))) return;
    if (fileTabs.get(id)?.hosting) {
      const { endSharing } = await import("@canvas-ui/share/host-session");
      await endSharing(tab.fileId);
      // What the guests wrote meanwhile.
      await handle?.flush();
    }
    await handle?.capture();
    // Saves a hosted tab's pending changes while its document is still there.
    stopDocumentAutosave(id);
    fileTabs.close(id);
  } catch (error) {
    notifyError(t("close.failed"), error);
  } finally {
    closing.delete(id);
  }
}

/** Whether the tab may close, once its changes are saved or the user let them go. */
async function settle(id: string, handle: TabHandle): Promise<boolean> {
  if (!handle.needsSave()) {
    await handle.finish();
    // The closing autosave may have failed just now.
    if (!handle.needsSave()) return true;
  }
  const name = fileTabs.get(id)?.name ?? "";
  const choice = await askToCloseTab(name, () => handle.save());
  if (choice === "cancel") return false;
  // Saved: the engine's last writes still go in (saved when autosave is on).
  if (choice === "save") await handle.finish();
  return true;
}
