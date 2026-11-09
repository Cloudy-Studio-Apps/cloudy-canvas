import type { EditorSlots } from "./editor-slots.types";

const mounted = new Set<string>();
const waiters = new Map<string, (() => void)[]>();

/**
 * The tabs whose editor slot is mounted (`TabEditorSlot`), so the memory policy can wait until a
 * tab's editor is really gone before its document goes. Not reactive.
 */
export const editorSlots: EditorSlots = {
  mount(id) {
    mounted.add(id);
    return () => {
      mounted.delete(id);
      const waiting = waiters.get(id) ?? [];
      waiters.delete(id);
      // Their continuations run after this commit, once every cleanup in it ran.
      for (const resolve of waiting) resolve();
    };
  },
  whenUnmounted: (id) =>
    new Promise((resolve) => {
      if (!mounted.has(id)) return resolve();
      waiters.set(id, [...(waiters.get(id) ?? []), resolve]);
    }),
};
