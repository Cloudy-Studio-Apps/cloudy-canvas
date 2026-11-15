import type { ReactNode } from "react";

import { Store } from "@canvas";
import type { DesignEngine } from "../../../../design-engine.types";
import type { SplitDialogState } from "./split-dialog-store.types";

/** One per editor, so a dialog shows only in the editor whose page is being split. */
const stores = new WeakMap<DesignEngine, Store<SplitDialogState>>();

/** The editor's split dialog state, read by `SplitDialogHost`. */
export function splitDialogStore(engine: DesignEngine): Store<SplitDialogState> {
  let store = stores.get(engine);
  if (!store) {
    store = new Store<SplitDialogState>({ node: null });
    stores.set(engine, store);
  }
  return store;
}

/** Shows `render`'s dialog in the editor until `done` runs; resolves with its value. */
export function showSplitDialog<T>(
  engine: DesignEngine,
  render: (done: (value: T | null) => void) => ReactNode,
): Promise<T | null> {
  const store = splitDialogStore(engine);
  return new Promise((resolve) => {
    const done = (value: T | null) => {
      store.set({ node: null });
      resolve(value);
    };
    store.set({ node: render(done) });
  });
}
