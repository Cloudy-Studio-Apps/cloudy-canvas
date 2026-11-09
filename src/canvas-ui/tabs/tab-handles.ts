import type { TabHandle, TabHandles } from "./tab-handles.types";

const handles = new Map<string, TabHandle>();
/** Who watches a tab's handle being removed (`onRemove`). */
const watchers = new Map<string, Set<(handle: TabHandle) => void>>();

/**
 * The handles of the tabs whose editor is mounted, set by each file's saver: closing a tab or the
 * window flushes, saves and captures through them. Not reactive: read when acting.
 */
export const tabHandles: TabHandles = {
  set(id, handle) {
    handles.set(id, handle);
    return () => {
      if (handles.get(id) !== handle) return;
      handles.delete(id);
      for (const watch of watchers.get(id) ?? []) watch(handle);
    };
  },
  get: (id) => handles.get(id),
  onRemove(id, listener) {
    const set = watchers.get(id) ?? new Set();
    set.add(listener);
    watchers.set(id, set);
    return () => {
      set.delete(listener);
      if (set.size === 0 && watchers.get(id) === set) watchers.delete(id);
    };
  },
};
