import { useCallback, useContext, useSyncExternalStore } from "react";

import { TabContext } from "./tab-context";

const noSubscription = () => () => undefined;

/**
 * Whether the editor's tab is the one on screen; `true` outside a file tab. Window-wide listeners
 * that act on an editor (shortcuts, drops) check it, so a tab in the background ignores them.
 */
export function useIsActiveTab(): boolean {
  const context = useContext(TabContext);
  const read = useCallback(
    () => !context || context.tabs.store.get().activeId === context.tabId,
    [context],
  );
  return useSyncExternalStore(context?.tabs.store.subscribe ?? noSubscription, read);
}
