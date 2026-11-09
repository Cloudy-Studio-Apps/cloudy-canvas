# App frame and file tabs

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

- **`fileTabs`** (`file-tabs-instance.ts`) is the app's one `FileTabs` ([canvas/tabs/](../../canvas/tabs/README.md)),
  with each product's `TabLoader` imported the first time a tab of it loads, so the shell's first
  load never holds a product (only `@canvas/tabs` and `@canvas-ui/tabs` are imported by path, not
  their whole barrels). Where tabs aren't supported (`tabsSupported()` false: Android) it keeps one
  file tab (`maxFileTabs: 1`): opening a file closes the open one, as before tabs.
- **`AppFrame`** (`app-frame.tsx`) is the root route's element: it provides `FileTabsContext`, runs
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
