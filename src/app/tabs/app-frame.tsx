import { useEffect, useSyncExternalStore } from "react";
import { Outlet, useNavigate } from "react-router";

import { FileTabsContext, TabHost } from "@canvas-ui/tabs";
import { tabsSupported } from "@platform";
import { TitleBar } from "../title-bar";
import { AppCloseGuard } from "./app-close-guard";
import { CloseTabDialogHost } from "./close-tab-dialog-host";
import { fileTabs } from "./file-tabs-instance";
import { watchHostedTabs } from "./hosted-tabs";
import { watchRoomPresence } from "./room-presence-mirrors";
import { TAB_EDITORS } from "./tab-editors";
import { fileRouteOf } from "./tab-route";
import { startTabsPersistence } from "./tabs-persistence";
import { useTabShortcuts } from "./use-tab-shortcuts";
import { useRouteTabSync } from "./use-route-tab-sync";

/**
 * The window under every route: the title bar (desktop), the Home area (Home, Settings, Projects, … through `<Outlet />`)
 * and the open file tabs' editors over it. The route opens and shows tabs (`useRouteTabSync`);
 * while a file tab is shown, the Home area is hidden. On desktop it also holds the window's close
 * guard and the close-tab question (Android keeps each file's own guard). It runs the tabs' memory
 * policy on its timer for the app's life and, on desktop, keeps the hosted file's tab live and
 * saved without an editor (`watchHostedTabs`) and mirrors the live sessions' people
 * (`watchRoomPresence`). On desktop it also reopens the last session's tabs once at start and
 * saves them as they change (`startTabsPersistence`).
 */
export function AppFrame() {
  useRouteTabSync();
  useTabShortcuts();
  const navigate = useNavigate();
  useEffect(
    () =>
      startTabsPersistence(fileTabs, {
        startedOnHome: !fileRouteOf(window.location.pathname),
        navigate: (route) => void navigate(route, { replace: true }),
      }),
    [navigate],
  );
  useEffect(() => fileTabs.startPolicy(), []);
  useEffect(() => (tabsSupported() ? watchHostedTabs(fileTabs) : undefined), []);
  useEffect(() => (tabsSupported() ? watchRoomPresence(fileTabs) : undefined), []);
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
