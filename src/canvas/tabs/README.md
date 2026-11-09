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
whether it's `unsaved` or `hosting` a live session (set by the app: `watchHostedTabs`), the agent sessions bound to it (`agents`) and
when it was last shown (`lastActiveAt`) or called by an agent (`lastAgentCallAt`). A joined live
session's tab has `live` (its `ShareGuest`) and the `fileId` `live:<fileId>`, so it never matches
the stored file. Documents come from the product's `TabLoader` (`loaders`, one per `FileType`),
which reads storage, or the session when `live` is given: a live tab never reloads from storage.
Once loaded, the tab's `name` is the file's (`info.name`, drafts included); its editor then keeps
it in step with the title. `setInfo(id, info)` replaces a loaded tab's `load.info` when its file is
saved somewhere new (the first save, Save as, a draft becoming a file), so an editor mounted again
on the document sees the saved file, not a new one.

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
  `maxFileTabs` (1 on Android) closes the least recently shown tabs to make room; the one on
  screen goes only for a tab opened to replace it, never for one opened in the background.
- `activate(id)` shows a tab (`null`: Home): it becomes `active` and loads, and the tab left
  becomes `headless`. Both get `lastActiveAt`.
- `setState(id, state)` moves a background tab between `hibernated`, `document` and `headless`
  (the active one changes only through `activate`). `hibernated` destroys the document (its undo
  history goes with it) and sets `load` back to `idle`; the others load it if it isn't in memory.
  The memory policy (below) is what calls it; it never hibernates a tab with an agent bound, a
  live session or unsaved changes (`mayHibernate`).
- `close(id)` destroys the document, leaves the tab's live session and, for a stored file,
  remembers it: `reopenClosed()` opens the last of the 10 closed ones (this session only). Closing
  the active tab shows its right neighbor, else its left one, else Home. Asking about unsaved
  changes is the host's job, before it calls `close`.

`ensureLoaded(id)` returns the document, loading it once (concurrent calls share the load); a
`hibernated` tab whose document it loads becomes `document` (a tab holding its document is at
least that). A document whose load ends after its tab was hibernated or closed is destroyed. A failed load leaves
`load` in `error`; the next `ensureLoaded` tries again.

## Agents

`bindAgent(id, session)` binds an agent session to one tab (moving it out of the one it was in),
`unbindAgent(session)` frees it, and `noteAgentCall(id)` sets `lastAgentCallAt` (the app calls it
before each of a bound agent's calls, [app/mcp/](../../app/mcp/README.md#agents-and-tabs)). `move(id, index)`
reorders the tabs; `dispose()` destroys every document and leaves every live session.

## The memory policy

`evaluate()` moves the background tabs between states; it runs after every change (once per batch,
in a microtask) and every `TAB_POLICY_INTERVAL_MS` (10 s) once the app calls `startPolicy()`
(`app/tabs/AppFrame`), since time alone moves tabs down. `targetState(tab, ctx)` (`tab-policy.ts`)
is the table below, first match wins (`ctx.recentRank`: the tab's place among the most recently
shown ones, 0 the most recent, the active tab included):

| Tab                                                                           | State        |
| ----------------------------------------------------------------------------- | ------------ |
| On screen                                                                     | `active`     |
| Left less than `leaveGraceMs` ago                                             | `headless`   |
| An agent bound and calling (`now - lastAgentCallAt < agentActiveMs`)          | `headless`   |
| Hosting a live session while autosave is off (`needsEditor`)                  | `headless`   |
| An agent bound but quiet, a live session (hosted or joined), or `unsaved`     | `document`   |
| Among the `recentTabs` most recent, or shown less than `hibernateAfterMs` ago | `document`   |
| Otherwise                                                                     | `hibernated` |

The numbers are `TAB_LIMITS` (`tab-limits.ts`), tunable: `leaveGraceMs` 30 s, `agentActiveMs` 2 min
(the title bar's pulsing agent avatar uses it too), `recentTabs` 5, `hibernateAfterMs` 10 min,
`maxHeadless` 3.

`planTabStates` turns that into moves: a tab only goes **down** to its target, never up, so a tab
opened in the background or restored and never clicked stays `hibernated` with no document until
it's shown; the exceptions are an agent calling and a hosted tab with autosave off
(`needsEditor`), which bring the tab's engine back (`headless`). Then at most `maxHeadless` tabs keep an engine: past that, the least recently shown
headless tabs drop to `document`, the ones an agent is calling last. A live tab keeps its session
connected with its document only, and never hibernates (`mayHibernate`): a joined one's
`ShareGuest` is the tab's, and a hosted file's session outlives its editor, which the app saves
meanwhile (`watchHostedTabs`, [app/tabs/](../../app/tabs/README.md)). That autosave follows the
setting, which the app passes to `setAutosave(enabled)`: while autosave is off a hosted tab keeps
its editor (one already `document` is brought back once the document autosave saved what it had),
so the guests' edits are unsaved changes its editor holds, asked about on close and quit like any
other.

`TabMemory` (`tab-memory.ts`) does this for `FileTabs` (which keeps `evaluate`, `startPolicy`,
`setLeaveGuard` and `setAutosave` as its API), acting through its `get` and `setState`.

**Leaving `headless`** (`TabMemory.leave`): a background tab's editor goes only after the host
readied it, through the `TabLeaveGuard` it sets with `setLeaveGuard`
(`canvas-ui/tabs/tabLeaveGuard`): its pending autosave is flushed, its preview taken, and before
hibernating its closing work run (the engine's last writes, the sweep of unused assets and their
save). Meanwhile the tab stays `headless` with its editor mounted and the policy leaves it alone.
Then it goes to `document` (the editor unmounts) and, toward `hibernated`, its document is
destroyed only once the editor's slot has unmounted and the save its editor started then is done
(`guard.unmounted`). A tab shown again meanwhile keeps its editor (and isn't hibernated).

**The cap can be passed**: a tab whose changes nothing would save (autosave off or failing)
keeps its editor, since a `document` tab has no editor to save it or ask about it; a hosted
tab while autosave is off (`needsEditor`) is never dropped either. Such tabs can make more than
`maxHeadless` engines. A kept tab is tried again on the
next timed run. A failing `prepare` is logged once per tab (`console.warn`) and tried again then
too.
