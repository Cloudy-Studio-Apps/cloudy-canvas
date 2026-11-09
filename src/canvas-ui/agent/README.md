# Agent files

_How it works. The rules are in the root [CLAUDE.md](../../../CLAUDE.md)._

What editors give agents ([app/mcp/](../../app/mcp/README.md#agents-and-tabs) reads it).

- **`createAgentFiles<F>(noun)`** is a per-product registry of the `AgentFile` of every tab whose
  editor is mounted (active or headless), by tab id: `get(tabId)`, `set(tabId, file | null)`,
  `waitFor(tabId)` (resolves once the tab's editor registered its file; rejects after 15 s with
  "The `<noun>` `<tabId>` couldn't be opened.") and `active()`, the file of the tab on screen
  (`setActive`). The products hold one each (`boardFiles`, `designFiles`, with `getActiveBoard()` /
  `getActiveDesign()` = `active()`).
- **`useAgentFile(files, id, engine, file)`**, called by each product's session
  (`useAgentBoard`, `useAgentDesign`), registers the file under its tab (`useTabContext().tabId`)
  while its editor is mounted, removes it on unmount and marks it active while its tab is on
  screen (`useIsActiveTab`).
