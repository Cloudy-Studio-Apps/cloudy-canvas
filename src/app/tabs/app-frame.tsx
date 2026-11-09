import { useSyncExternalStore } from "react";
import { Outlet } from "react-router";

import { FileTabsContext, TabHost } from "@canvas-ui/tabs";
import { fileTabs } from "./file-tabs-instance";
import { TAB_EDITORS } from "./tab-editors";
import { useRouteTabSync } from "./use-route-tab-sync";

/**
 * The window under every route: the Home area (Home, Settings, Projects, … through `<Outlet />`)
 * and the open file tabs' editors over it. The route opens and shows tabs (`useRouteTabSync`);
 * while a file tab is shown, the Home area is hidden.
 */
export function AppFrame() {
  useRouteTabSync();
  const fileShown = useSyncExternalStore(
    fileTabs.store.subscribe,
    () => fileTabs.store.get().activeId !== null,
  );
  return (
    <FileTabsContext value={fileTabs}>
      <div className="relative h-full">
        <div className="h-full" hidden={fileShown}>
          <Outlet />
        </div>
        <TabHost editors={TAB_EDITORS} />
      </div>
    </FileTabsContext>
  );
}
