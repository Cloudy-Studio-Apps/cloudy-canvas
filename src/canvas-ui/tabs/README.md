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
  tab's slot is visible; the others stay mounted (engine and editor state kept) at the same size
  (`inset-0`, so the camera's viewport and the engine's `ResizeObserver` stay right) but
  `invisible`, `inert`, `aria-hidden` and `pointer-events-none`. A joined live session's slot also
  shows `ReconnectingBanner` (`share/`).
- **Headless editors.** Each editor calls `useSuspendWhenHidden(engine)` once it has an engine: it
  runs `engine.setSuspended(!active)`, so a background tab's engine draws nothing and ignores input
  (the engine listens for keys on the whole window, so `inert` alone wouldn't stop them) while its
  scene keeps following the document (agents, exports and thumbnails still work).
  `useIsActiveTab()` (`true` outside a tab) gates the other window-wide listeners that act on an
  editor: the file drop target (`useCanvasFileDrop`), the crop overlay's and the live 3D edit's
  Enter/Esc, the color wizard's keys; presence stops following the pointer while the engine is
  `suspended`.
- **`TabContext`** (`tab-context.ts`) is the tab an editor shows (`{ tabs, tabId }`, plus what its
  file reports to it, built by the slot with `tabContextValue`: `reportUnsaved`, `reportInfo`
  (`FileTabs.setInfo`) and `reportName`, each changing the tab only when the value differs;
  `useTabContext()` reads it). `useTab()` is
  the `FileTab`, re-read when it changes: its `load` (the document, owned by the tab: editors never
  destroy it), `fileId`, `live`. `useTabParam(name)` reads the search params of the route the tab
  opened with (`dir`, `project`, `libraries`, `starter`, `mode`), and `useDropTabParam()` forgets
  one once used (a starter runs once). Editors and their session hooks read these instead of the
  router's search params, since a tab outlives its route.
- **`tabHandles`** (`tab-handles.ts`) holds, by tab id, the `TabHandle` of each tab whose editor is
  mounted, registered by its file's saver (`useCanvasFileSaver`): `save()`, `flush()` (the pending
  autosave now, awaited), `finish()` (the closing work: the engine's last writes, then the
  autosave), `capture()` (the preview) and `needsSave()` (changes nothing will save, as of now).
  Not reactive: the app reads it when closing a tab or the window (`app/tabs/`). A tab with no
  handle (hibernated, a live guest) has nothing to save.
