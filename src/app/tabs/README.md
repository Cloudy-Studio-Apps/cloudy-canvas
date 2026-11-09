# App frame and file tabs

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

- **`fileTabs`** (`file-tabs-instance.ts`) is the app's one `FileTabs` ([canvas/tabs/](../../canvas/tabs/README.md)),
  with each product's `TabLoader` imported the first time a tab of it loads, so the shell's first
  load never holds a product (only `@canvas/tabs` and `@canvas-ui/tabs` are imported by path, not
  their whole barrels). Where tabs aren't supported (`tabsSupported()` false: Android) it keeps one
  file tab (`maxFileTabs: 1`): opening a file closes the open one, as before tabs (the route sync
  leaves it first, see below).
- **`AppFrame`** (`app-frame.tsx`) is the root route's element: on desktop it puts the
  [title bar](../title-bar/README.md) on top, with everything below it in its own area; it provides `FileTabsContext`, runs
  the route sync and renders the Home area (`<Outlet />`: Home, Settings, Projects, Join, …) with
  the tabs' editors over it (`TabHost` with `TAB_EDITORS`, each product's editor loaded with
  `lazyComponent`, the full-window loading screen until it's there). While a file tab is shown, the
  Home area is hidden. It starts the tabs' memory policy (`fileTabs.startPolicy()`, every 10 s,
  [canvas/tabs/](../../canvas/tabs/README.md#the-memory-policy)) for the app's life.
- **Route sync** (`useRouteTabSync`): the file routes `/board/:id` and `/design/:id` render nothing
  themselves. A file route opens its tab (`fileTabs.open({ type, fileId, params })`, `params` from
  the search params; an id that isn't in storage is a new file, as before), so every existing
  `navigate("/<type>/<id>?…")` keeps working; an open file linked to again with params takes them.
  Any other route shows Home (`activate(null)`, `openRouteTab` in `open-route-tab.ts`). On Android
  (one file at a time) a route to another file or away from files first leaves the open one
  (`leaveFile`, `leave-file.ts`: the editor's `finish()` while it's still mounted, so the engine's
  last writes, the sweep and the pending autosave see the document, then `fileTabs.close`), as
  leaving the editor did before tabs; Android's route changes run one after another (a newer one
  makes an older one skip showing its route), and the route doesn't follow the active tab while
  one is pending. The queue never stays stuck: waiting for `finish()` is capped at 5 s (as the
  quit tasks are), and a file that fails to close is reported (`notifyError`) without stopping the
  other leaves or the route. `FileTabs`' own `maxFileTabs` limit is only a safety net. The other way, when the active tab changes from elsewhere (a tab click, closing the
  active tab, a joined session's tab), its route (`tabRoute`: `/<type>/<fileId>`, no params) replaces
  the address, or `/` for Home, so switching tabs doesn't fill the history. A joined session's route
  (`/<type>/live:<fileId>`) only shows its open tab; once that's closed it goes Home.
- **Restoring tabs** (`startTabsPersistence`, `tabs-persistence.ts`; desktop, started once by
  `AppFrame` after the route sync): the tabs are saved to `localStorage` (`cloudy-canvas:tabs`,
  `{ tabs: { type, fileId }[], active }`, file ids not tab ids) 0.5 s after they change and when the
  window hides. Joined sessions (`live:` ids) and files never saved anywhere (loaded, no
  `FileInfo`) aren't saved. At startup each saved file whose `storage.get` finds it (drafts have
  stable ids there, so they come back; a missing file is dropped silently) is opened with
  `open(…, { activate: false })`: a `hibernated` tab that loads nothing until it's clicked. Then,
  only if the app started on Home and is still there (the user may have gone to Settings or
  Projects meanwhile; nothing happens at all once persistence was stopped), it navigates to the saved active tab's route and the route sync
  shows (and loads) it. A start on a file (the OS opened it, a link) keeps the tab that launch
  chose, and the others still come back behind it. Saving begins only after this restore, so the
  empty tab list at startup never overwrites the saved one. Android keeps today's behavior.
- **Hosted tabs** (`watchHostedTabs`, `hosted-tabs.ts`; desktop, started by `AppFrame`): the tab of
  the file this app shares is `hosting` (from `sharingState`, `canvas-ui/share/`, with or without
  its editor), and a live session outlives its editor: the memory policy drops a background live tab
  to `document`. While a hosted tab is `document`, `startDocumentAutosave(tab, format)`
  (`document-autosave.ts`; the product's `CanvasFileFormat` from `FILE_FORMATS`, imported with the
  product) saves the guests' edits as the editor would (1.5 s after changes stop, at most every
  10 s, only while autosave is on, and before quitting; it starts with one save scheduled, so guest
  edits made between the editor's closing save and its start aren't lost) with `saveCanvasDocument`
  (`canvas-ui/file/`), reporting the file to the tab (`setInfo`) and its `unsaved`. It starts once
  the editor's closing save is done (`tabLeaveGuard.unmounted`) and stops, saving what's pending,
  when an editor mounts for the tab again, sharing stops or the tab closes; writes to one file go
  in line whoever makes them, so the editor's and this one never overlap. A joined session's tab
  needs nothing here: its `ShareGuest` is the tab's. It also passes the autosave setting to the
  memory policy (`fileTabs.setAutosave`): while autosave is off a hosted tab keeps its editor (one
  in `document` is brought back after the document autosave's last save), so its changes are
  asked about on close and quit as usual.
- **Knocks** (`HostedKnocksHost`, `hosted-knocks-host.tsx`; desktop, mounted by `AppFrame`): while
  this app shares a file (`sharingState`), it loads `HostedKnocks` (`canvas-ui/share/`, a lazy
  import, so the shell never holds the sharing code) and shows the people asking to join over any
  tab, naming the file (its tab's name): the hosted file's editor may be in the background or gone.
  The hosting tab's button shows a badge meanwhile (`TabKnockBadge`, `title-bar/`).
- **Room presence** (`watchRoomPresence`, `room-presence-mirrors.ts`; desktop, started by
  `AppFrame`): mirrors the people of every live session the app is in (the hosted file's,
  `sharingState`, and each joined tab's `live`) into the collaborators with `mirrorRoomPresence`
  (`canvas-ui/share/`), for as long as the session lasts, editor or not, so a live tab in the
  background still shows who is in it (`TabAvatars`). Each room forgets only its own people when it
  ends. The editor only publishes the user's own presence while it's mounted.
- **Closing** (desktop; `AppFrame` mounts these only where `tabsSupported()`):
  - `closeTab(id)` (`close-tab.ts`) closes a tab without losing its changes. Through its
    `tabHandles` handle (`canvas-ui/tabs/`): changes nothing will save (autosave off or failing,
    `needsSave()`) ask first, `CloseTabDialog`: Save · Don't save · Cancel (`askToCloseTab` in
    `close-tab-prompt.ts`, shown by `CloseTabDialogHost`; the dialog waits while saving, and a
    cancelled or failed save keeps the tab). Otherwise it runs `finish()` (the engine's last writes
    and the pending autosave, while the document is still there) and asks if that autosave failed.
    A hosted file's session ends with its tab (`endSharing`, with a toast) and what the guests
    wrote meanwhile is saved (the editor's `flush`, or the document autosave's last save). Then it
    takes the preview and calls `fileTabs.close`, which leaves a joined live session; the agents
    bound to the tab go with it. A tab with no editor mounted (hibernated, a live guest) just
    closes. A tab already closing isn't asked about twice.
  - `AppCloseGuard` (`app-close-guard.tsx`) is the window's one `appLifecycle.onCloseRequest`: it
    flushes every mounted tab's pending autosave, then quits once the previews are taken (at most
    5 s for each step), or asks once when some tab has changes nothing will save: Save all and
    quit (one tab at a time, stopping at a cancelled or failed save) · Quit without saving ·
    Cancel. Each editor's quit tasks run after it. Android keeps each file's `CloseFileGuard`
    instead.
- **Shortcuts** (`useTabShortcuts`, `tab-keybindings.ts`; desktop, mounted by `AppFrame`):
  `TAB_KEYBINDINGS` is the one source and `tabKeymap` the one `Keymap` for matching and for labels
  (the close button's tooltip): Ctrl+Tab / Ctrl+Shift+Tab next and previous (Home first, then the
  file tabs, wrapping), Ctrl+W closes the active file tab (`closeTab`; Home does nothing),
  Ctrl+Shift+T reopens the last closed one, Ctrl+1…9 go to the 1st…9th file tab (nothing if there
  are fewer; Home is reached with next/previous or its tab). They're matched on the window in the
  capture phase, before a canvas or text field sees them (they work while typing), and a matched key
  is stopped; a key repeat only repeats next/previous. No product binds Ctrl+W, Ctrl+Tab,
  Ctrl+Shift+T or Ctrl+digit (the engine's zoom keys are Shift+1 and Shift+2 without Ctrl), so the
  tab shortcuts win nowhere over an editing shortcut. The Windows browser guard only blocks
  F3/F5/F7 and Ctrl+F/G/J/P/R, so it doesn't touch these.
  The shortcuts do nothing while a modal dialog is open (an open `dialog-content` or alertdialog in
  the document, which covers the close-tab and window-close questions), and the key goes on to the
  dialog. On macOS, Cmd+Tab is the system's, so next/previous are shown as Cmd+Shift+] / [ (Ctrl+Tab
  works too). Not changed here (Rust, to verify on a Mac): the native menu's Close Window (Cmd+W)
  may take Cmd+W before the webview sees it.
