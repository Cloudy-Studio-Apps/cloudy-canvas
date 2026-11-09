import { useEffect, useSyncExternalStore } from "react";
import { Outlet } from "react-router";

import { FileTabsContext, TabHost } from "@canvas-ui/tabs";
import { tabsSupported } from "@platform";
import { TitleBar } from "../title-bar";
import { AppCloseGuard } from "./app-close-guard";
import { CloseTabDialogHost } from "./close-tab-dialog-host";
import { fileTabs } from "./file-tabs-instance";
import { watchHostedTabs } from "./hosted-tabs";
import { TAB_EDITORS } from "./tab-editors";
import { useRouteTabSync } from "./use-route-tab-sync";

/**
 * The window under every route: the title bar (desktop), the Home area (Home, Settings, Projects, … through `<Outlet />`)
 * and the open file tabs' editors over it. The route opens and shows tabs (`useRouteTabSync`);
 * while a file tab is shown, the Home area is hidden. On desktop it also holds the window's close
 * guard and the close-tab question (Android keeps each file's own guard). It runs the tabs' memory
 * policy on its timer for the app's life and, on desktop, keeps the hosted file's tab live and
 * saved without an editor (`watchHostedTabs`).
 */
export function AppFrame() {
  useRouteTabSync();
  useEffect(() => fileTabs.startPolicy(), []);
  useEffect(() => (tabsSupported() ? watchHostedTabs(fileTabs) : undefined), []);
  const fileShown = useSyncExternalStore(
    fileTabs.store.subscribe,
    () => fileTabs.store.get().activeId !== null,
  );
  return (
    <FileTabsContext value={fileTabs}>
      <div className="flex h-full flex-col">
        {tabsSupported() && <TitleBar />}
        <div className="relative min-h-0 flex-1">
          <div className="h-full" hidden={fileShown}>
            <Outlet />
          </div>
          <TabHost editors={TAB_EDITORS} />
        </div>
        {tabsSupported() && (
          <>
            <AppCloseGuard />
            <CloseTabDialogHost />
          </>
        )}
      </div>
    </FileTabsContext>
  );
}
