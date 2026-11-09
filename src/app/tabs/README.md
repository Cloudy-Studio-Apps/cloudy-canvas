# App frame and file tabs

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

- **`fileTabs`** (`file-tabs-instance.ts`) is the app's one `FileTabs` ([canvas/tabs/](../../canvas/tabs/README.md)),
  with each product's `TabLoader` imported the first time a tab of it loads, so the shell's first
  load never holds a product (only `@canvas/tabs` and `@canvas-ui/tabs` are imported by path, not
  their whole barrels). Where tabs aren't supported (`tabsSupported()` false: Android) it keeps one
  file tab (`maxFileTabs: 1`): opening a file closes the open one, as before tabs.
- **`AppFrame`** (`app-frame.tsx`) is the root route's element: on desktop it puts the
  [title bar](../title-bar/README.md) on top, with everything below it in its own area; it provides `FileTabsContext`, runs
  the route sync and renders the Home area (`<Outlet />`: Home, Settings, Projects, Join, …) with
  the tabs' editors over it (`TabHost` with `TAB_EDITORS`, each product's editor loaded with
  `lazyComponent`, the full-window loading screen until it's there). While a file tab is shown, the
  Home area is hidden.
- **Route sync** (`useRouteTabSync`): the file routes `/board/:id` and `/design/:id` render nothing
  themselves. A file route opens its tab (`fileTabs.open({ type, fileId, params })`, `params` from
  the search params; an id that isn't in storage is a new file, as before), so every existing
  `navigate("/<type>/<id>?…")` keeps working; an open file linked to again with params takes them.
  Any other route shows Home (`activate(null)`; on Android it closes the open file, as leaving the
  editor did). The other way, when the active tab changes from elsewhere (a tab click, closing the
  active tab, a joined session's tab), its route (`tabRoute`: `/<type>/<fileId>`, no params) replaces
  the address, or `/` for Home, so switching tabs doesn't fill the history. A joined session's route
  (`/<type>/live:<fileId>`) only shows its open tab; once that's closed it goes Home.
- **Closing** (desktop; `AppFrame` mounts these only where `tabsSupported()`):
  - `closeTab(id)` (`close-tab.ts`) closes a tab without losing its changes. Through its
    `tabHandles` handle (`canvas-ui/tabs/`): changes nothing will save (autosave off or failing,
    `needsSave()`) ask first, `CloseTabDialog`: Save · Don't save · Cancel (`askToCloseTab` in
    `close-tab-prompt.ts`, shown by `CloseTabDialogHost`; the dialog waits while saving, and a
    cancelled or failed save keeps the tab). Otherwise it runs `finish()` (the engine's last writes
    and the pending autosave, while the document is still there) and asks if that autosave failed.
    Then it takes the preview and calls `fileTabs.close`, which leaves a joined live session; the
    agents bound to the tab go with it. A tab with no editor mounted (hibernated, a live guest) just
    closes. A tab already closing isn't asked about twice.
  - `AppCloseGuard` (`app-close-guard.tsx`) is the window's one `appLifecycle.onCloseRequest`: it
    flushes every mounted tab's pending autosave, then quits once the previews are taken (at most
    5 s for each step), or asks once when some tab has changes nothing will save: Save all and
    quit (one tab at a time, stopping at a cancelled or failed save) · Quit without saving ·
    Cancel. Each editor's quit tasks run after it. Android keeps each file's `CloseFileGuard`
    instead.
