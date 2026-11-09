import { useEffect, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router";

import { tabsSupported } from "@platform";
import { fileTabs } from "./file-tabs-instance";
import { fileRouteOf, tabRoute } from "./tab-route";

/**
 * Keeps the route and the tabs in step. A file route (`/<type>/<id>?…`, every existing
 * `navigate` to a file) opens its tab, a new file when the id isn't in storage; any other route
 * shows Home (on Android it closes the open file, as leaving the editor did before tabs). The other
 * way, a tab shown from elsewhere (a tab click, closing the active tab, a joined session) puts its
 * route in the address with `replace`, so tab clicks don't fill the history.
 */
export function useRouteTabSync(): void {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const activeId = useSyncExternalStore(
    fileTabs.store.subscribe,
    () => fileTabs.store.get().activeId,
  );

  useEffect(() => {
    const file = fileRouteOf(pathname);
    if (!file) {
      if (tabsSupported()) fileTabs.activate(null);
      else for (const tab of fileTabs.store.get().tabs) fileTabs.close(tab.id);
      return;
    }
    const existing = fileTabs.byFileId(file.id);
    // A joined session's tab can't come back from its route once it's closed.
    if (!existing && file.id.startsWith("live:")) {
      void navigate("/", { replace: true });
      return;
    }
    const params = Object.fromEntries(new URLSearchParams(search));
    const tab = fileTabs.open({ type: file.type, fileId: file.id, params });
    // An open file linked to again with params (`?mode=`) takes them, as its editor did.
    if (existing && Object.keys(params).length > 0) {
      fileTabs.patch(tab.id, { params: { ...existing.params, ...params } });
    }
  }, [pathname, search, navigate]);

  useEffect(() => {
    // Read now: the effect above may have just changed the active tab.
    const { activeId: shown } = fileTabs.store.get();
    const tab = shown ? fileTabs.get(shown) : undefined;
    const file = fileRouteOf(pathname);
    if (!tab) {
      if (file) void navigate("/", { replace: true });
    } else if (!file || file.id !== tab.fileId || file.type !== tab.type) {
      void navigate(tabRoute(tab), { replace: true });
    }
  }, [activeId, pathname, navigate]);
}
