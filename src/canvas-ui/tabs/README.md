# File tabs (UI)

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

The React side of the file tabs (`FileTabs`, [canvas/tabs/](../../canvas/tabs/README.md)). It never
knows a product: the app gives `TabHost` each product's editor (`app/tabs/`).

- **`FileTabsContext`** holds the app's one `FileTabs`. `useFileTabs(selector)` reads a slice of its
  snapshot with `useSyncExternalStore` (the selector returns something stable: a field, a tab, a
  primitive); `useFileTabsModel()` is the `FileTabs` itself, to act on it.
- **`TabHost({ editors })`** renders a `TabEditorSlot` for every tab that needs an engine, the active
  one and the `headless` ones (a `hibernated` or `document` tab has no editor). Each slot fills the
  window, provides its `TabContext` and renders `editors[tab.type]` with `tabId`. Only the active
  tab's slot is visible; the others stay mounted (engine and editor state kept) but `invisible`.
  Pausing their drawing and input is still to come (they're hidden, nothing more). A joined live
  session's slot also shows `ReconnectingBanner` (`share/`).
- **`TabContext`** (`tab-context.ts`) is the tab an editor shows (`{ tabs, tabId }`). `useTab()` is
  the `FileTab`, re-read when it changes: its `load` (the document, owned by the tab: editors never
  destroy it), `fileId`, `live`. `useTabParam(name)` reads the search params of the route the tab
  opened with (`dir`, `project`, `libraries`, `starter`, `mode`), and `useDropTabParam()` forgets
  one once used (a starter runs once). Editors and their session hooks read these instead of the
  router's search params, since a tab outlives its route.
