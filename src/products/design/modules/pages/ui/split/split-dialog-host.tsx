import { useSyncExternalStore } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { splitDialogStore } from "./split-dialog-store";

/** Renders the dialog a page split step asked for (`PageSplitContext.dialog`). */
export function SplitDialogHost() {
  const store = splitDialogStore(useDesignEngine());
  const { node } = useSyncExternalStore(store.subscribe, store.get);
  return node;
}
