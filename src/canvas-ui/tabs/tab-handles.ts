import type { TabHandle, TabHandles } from "./tab-handles.types";

const handles = new Map<string, TabHandle>();

/**
 * The handles of the tabs whose editor is mounted, set by each file's saver: closing a tab or the
 * window flushes, saves and captures through them. Not reactive: read when acting.
 */
export const tabHandles: TabHandles = {
  set(id, handle) {
    handles.set(id, handle);
    return () => {
      if (handles.get(id) === handle) handles.delete(id);
    };
  },
  get: (id) => handles.get(id),
};
