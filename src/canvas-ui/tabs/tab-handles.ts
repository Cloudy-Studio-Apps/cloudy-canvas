import type { TabHandle, TabHandles } from "./tab-handles.types";

const handles = new Map<string, TabHandle>();
/** Who waits for a tab's handle to go (`whenRemoved`). */
const waiters = new Map<string, (() => void)[]>();

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
      const waiting = waiters.get(id) ?? [];
      waiters.delete(id);
      for (const resolve of waiting) resolve();
    };
  },
  get: (id) => handles.get(id),
  whenRemoved: (id) =>
    new Promise((resolve) => {
      if (!handles.has(id)) return resolve();
      waiters.set(id, [...(waiters.get(id) ?? []), resolve]);
    }),
};
