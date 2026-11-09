import type { TabLeaveGuard } from "@canvas";
import { tabHandles } from "./tab-handles";

/**
 * What the host does before the memory policy takes a background tab's editor away
 * (`FileTabs.setLeaveGuard`): its pending autosave, then its preview (a tab with no engine can't
 * take one), and before hibernating its closing work (the engine's last writes and their save),
 * since the document goes next. Changes nothing would save (autosave off or failing) keep the
 * editor. A tab with no handle (its editor still loading) has nothing to ready.
 */
export const tabLeaveGuard: TabLeaveGuard = {
  async prepare(id, target) {
    const handle = tabHandles.get(id);
    if (!handle) return true;
    await handle.flush();
    if (handle.needsSave()) return false;
    await handle.capture();
    if (target !== "hibernated") return true;
    await handle.finish();
    return !handle.needsSave();
  },
  async unmounted(id) {
    await tabHandles.whenRemoved(id);
    // The editor's closing save takes the document's data within the same turn of its unmount.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  },
};
