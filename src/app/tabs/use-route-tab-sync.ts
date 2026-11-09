import { useEffect, useRef, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router";

import { tabsSupported } from "@platform";
import { fileTabs } from "./file-tabs-instance";
import { leaveFile } from "./leave-file";
import { openRouteTab } from "./open-route-tab";
import { fileRouteOf, tabRoute } from "./tab-route";

/** Android's route changes, applied one after another (see `useRouteTabSync`). */
let androidRoutes: Promise<void> = Promise.resolve();

/**
 * Keeps the route and the tabs in step. A file route (`/<type>/<id>?…`, every existing
 * `navigate` to a file) opens its tab, a new file when the id isn't in storage; any other route
 * shows Home. On Android (one file at a time) the open file is left first (`leaveFile`: its
 * editor's closing work, then the tab closes), as leaving the editor did before tabs; those route
 * changes run one after another, and a newer one makes an older one skip its view. The other way, a
 * tab shown from elsewhere (a tab click, closing the active tab, a joined session) puts its route
 * in the address with `replace`, so tab clicks don't fill the history; not while Android is still
 * leaving a file, whose tab stays on screen until it's gone.
 */
export function useRouteTabSync(): void {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const activeId = useSyncExternalStore(
    fileTabs.store.subscribe,
    () => fileTabs.store.get().activeId,
  );
  /** Android route changes not applied yet. */
  const pending = useRef(0);

  useEffect(() => {
    const file = fileRouteOf(pathname);
    const params = Object.fromEntries(new URLSearchParams(search));
    const show = () => {
      if (!openRouteTab(file, params)) void navigate("/", { replace: true });
    };
    if (tabsSupported()) {
      show();
      return;
    }
    let current = true;
    pending.current += 1;
    androidRoutes = androidRoutes.then(async () => {
      try {
        if (!current) return;
        const leaving = fileTabs.store.get().tabs.filter((tab) => tab.fileId !== file?.id);
        for (const tab of leaving) await leaveFile(tab.id);
      } finally {
        // Counted down and shown in one step, so the effect below sees both or neither.
        pending.current -= 1;
        if (current) show();
      }
    });
    return () => {
      current = false;
    };
  }, [pathname, search, navigate]);

  useEffect(() => {
    if (pending.current > 0) return;
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
