import type { TabLeaveGuard } from "@canvas";
import { editorSlots } from "./editor-slots";
import type { TabHandle } from "./tab-handles.types";
import { tabHandles } from "./tab-handles";

/**
 * What the host does before the memory policy takes a background tab's editor away
 * (`FileTabs.setLeaveGuard`): its pending autosave, then its preview (a tab with no engine can't
 * take one), and before hibernating its closing work (the engine's last writes, the sweep and
 * their save), since the document goes next. Changes nothing would save (autosave off or failing)
 * keep the editor. A tab with no handle (its editor still loading) has nothing to ready.
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
  // Called as the tab drops to `document`, before React unmounts its slot.
  async unmounted(id) {
    const removed: TabHandle[] = [];
    const stop = tabHandles.onRemove(id, (handle) => removed.push(handle));
    try {
      await editorSlots.whenUnmounted(id);
    } finally {
      stop();
    }
    // The editor's closing save has the document's data once this resolves.
    await Promise.all(removed.map((handle) => handle.closed()));
  },
};
