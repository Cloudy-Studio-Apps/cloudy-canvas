# File tabs

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

`FileTabs` (`file-tabs.ts`, plain TS) is the list of files open in tabs on desktop, and it owns
each tab's `CanvasDocument`. The tabs are plain data (`FileTab`) in a `Store<FileTabsSnapshot>`
(`tabs` in order, `activeId`, `null` for Home); every change publishes a new snapshot, which React
reads with `useSyncExternalStore`. It never holds an engine: the host builds one for the tabs that
need it, from the tab's state.

## A tab

A `FileTab` is one file (`type`, `fileId`, `name`, `params`: the route's search params when it
opened), its `load` (`idle`, `loading`, `ready` with the document and its `FileInfo`, or `error`),
whether it's `unsaved` or `hosting` a live session, the agent sessions bound to it (`agents`) and
when it was last shown (`lastActiveAt`) or called by an agent (`lastAgentCallAt`). A joined live
session's tab has `live` (its `ShareGuest`) and the `fileId` `live:<fileId>`, so it never matches
the stored file. Documents come from the product's `TabLoader` (`loaders`, one per `FileType`),
which reads storage, or the session when `live` is given: a live tab never reloads from storage.
Once loaded, the tab's `name` is the file's (`info.name`, drafts included).

## The four states

| State        | In memory                                   |
| ------------ | ------------------------------------------- |
| `hibernated` | the file id, name, type and params          |
| `document`   | the document and its undo history           |
| `headless`   | + an engine and scene, no drawing or input  |
| `active`     | + drawing and the user's mouse and keyboard |

Who changes them:

- `open(source, { activate })` reuses the tab with the same `fileId`. A new one starts
  `hibernated` with nothing loaded; with `activate` (the default) it's shown at once.
  `maxFileTabs` (1 on Android) closes the least recently shown tabs to make room.
- `activate(id)` shows a tab (`null`: Home): it becomes `active` and loads, and the tab left
  becomes `headless`. Both get `lastActiveAt`.
- `setState(id, state)` moves a background tab between `hibernated`, `document` and `headless`
  (the active one changes only through `activate`). `hibernated` destroys the document (its undo
  history goes with it) and sets `load` back to `idle`; the others load it if it isn't in memory.
  The memory policy (to come) is what calls it; it must never hibernate a tab with an agent bound,
  a live session or unsaved changes.
- `close(id)` destroys the document, leaves the tab's live session and, for a stored file,
  remembers it: `reopenClosed()` opens the last of the 10 closed ones (this session only). Closing
  the active tab shows its right neighbor, else its left one, else Home. Asking about unsaved
  changes is the host's job, before it calls `close`.

`ensureLoaded(id)` returns the document, loading it once (concurrent calls share the load). A
document whose load ends after its tab was hibernated or closed is destroyed. A failed load leaves
`load` in `error`; the next `ensureLoaded` tries again.

## Agents

`bindAgent(id, session)` binds an agent session to one tab (moving it out of the one it was in),
`unbindAgent(session)` frees it, and `noteAgentCall(id)` sets `lastAgentCallAt`. `move(id, index)`
reorders the tabs; `dispose()` destroys every document and leaves every live session.
