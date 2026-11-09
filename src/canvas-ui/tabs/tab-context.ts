import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import type { FileTab, FileTabs } from "@canvas";
import type { TabContextValue, TabParam } from "./tab-context.types";

/** The tab an editor shows, provided by the tab host around each editor. */
export const TabContext = createContext<TabContextValue | null>(null);

/** The editor's tab context: its id and where its file reports to. */
export function useTabContext(): TabContextValue {
  const value = useContext(TabContext);
  if (!value) throw new Error("useTab must be used inside a file tab (TabContext)");
  return value;
}

/**
 * Reads the tab, or the last one seen once it's gone, so the render that closes it still has it
 * until the host unmounts its editor.
 */
function tabReader(tabs: FileTabs, tabId: string): () => FileTab | undefined {
  let last: FileTab | undefined;
  return () => (last = tabs.get(tabId) ?? last);
}

/** The editor's tab, re-read when it changes. */
export function useTab(): FileTab {
  const { tabs, tabId } = useTabContext();
  const read = useMemo(() => tabReader(tabs, tabId), [tabs, tabId]);
  const tab = useSyncExternalStore(tabs.store.subscribe, read);
  if (!tab) throw new Error(`No file tab ${tabId}`);
  return tab;
}

/** A search param of the route the tab opened with (`?dir=`, `?starter=`, …), `null` if absent. */
export function useTabParam(name: TabParam): string | null {
  return useTab().params[name] ?? null;
}

/** Forgets one of the tab's params, once it's been used (a starter runs once). */
export function useDropTabParam(): (name: TabParam) => void {
  const { tabs, tabId } = useTabContext();
  return useCallback(
    (name) => {
      const params = tabs.get(tabId)?.params;
      if (!params || !(name in params)) return;
      const rest = { ...params };
      delete rest[name];
      tabs.patch(tabId, { params: rest });
    },
    [tabs, tabId],
  );
}
