# Agent files

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

What editors give agents ([app/mcp/](../../app/mcp/README.md#agents-and-tabs) reads it).

- **`createAgentFiles<F>()`** is a per-product registry of the `AgentFile` of every tab whose
  editor is mounted (active or headless), by tab id: `get(tabId)`, `set(tabId, file | null)`,
  `subscribe(listener)` (the app waits on it for a tab's editor, with the tab's state and load:
  `app/mcp/agent-tab-files.ts`) and `active()`, the file of the tab on screen (`setActive`). The products hold one each (`boardFiles`, `designFiles`, with `getActiveBoard()` /
  `getActiveDesign()` = `active()`).
- **`useAgentFile(files, id, engine, file)`**, called by each product's session
  (`useAgentBoard`, `useAgentDesign`), registers the file under its tab (`useTabContext().tabId`)
  while its editor is mounted, removes it on unmount and marks it active while its tab is on
  screen (`useIsActiveTab`).
- **`variantChoices`** (`variant-choices-instance.ts`) is the app's one `createVariantChoices()`
  registry (see [canvas/mcp](../../canvas/mcp/README.md#variant-choices)): the agent host opens
  requests on it, and the chooser bar and the title bar's badge read its `store`.
- **`VariantChooserBar`** (mounted by `BoardChrome` and `DesignChrome`, also with the UI hidden)
  shows the tab's pending request through **`useVariantChooser()`**: the agent (its avatar and
  colour), its question, "B · 2 of 3", previous/next (`engine.zoomToElement`), "Compare all"
  (`engine.zoomToElements`), a note (`CommitInput`), "Keep this", "Keep all" and close. Only the
  variants still on the page on screen count (`engine.getElement`, re-read on every document
  change), and the one shown is kept by id, so deleting another never moves the choice. The user's view moves
  only on these buttons and once, the first time the request is shown on its page in the active tab
  (fit all). "Keep this" deletes the other variants with `engine.deleteElements` (one step in the
  user's history: the user chose) and resolves the request; on another page the bar offers only
  "Back to variants" (`engine.setScope`), so nothing is deleted on a page the user isn't looking at.
