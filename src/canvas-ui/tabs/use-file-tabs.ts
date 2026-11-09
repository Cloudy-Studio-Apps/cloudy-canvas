import { useCallback, useContext, useSyncExternalStore } from "react";

import type { FileTabs, FileTabsSnapshot } from "@canvas";
import { FileTabsContext } from "./file-tabs-context";

/** The app's `FileTabs` (`FileTabsContext`). */
export function useFileTabsModel(): FileTabs {
  const tabs = useContext(FileTabsContext);
  if (!tabs) throw new Error("useFileTabs must be used inside FileTabsContext");
  return tabs;
}

/**
 * A slice of the open tabs, re-read when they change. `selector` returns something stable (a
 * snapshot's field, a tab, a primitive), not a new object or array each call.
 */
export function useFileTabs<T>(selector: (snapshot: FileTabsSnapshot) => T): T {
  const tabs = useFileTabsModel();
  const read = useCallback(() => selector(tabs.store.get()), [tabs, selector]);
  return useSyncExternalStore(tabs.store.subscribe, read);
}
