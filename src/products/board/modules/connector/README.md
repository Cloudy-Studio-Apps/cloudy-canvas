# Connectors

Connectors (X): lines between shapes that follow them, with elbow routes, heads and the quick-connect dots on stickies and shapes.

- **Tier:** core
- **Requires:** —; after: er
- **Contributes:** kinds `ConnectorKind`; boardCanvas: `kinds`, `onRemove`, `options`, `prepareCopies`, `resolveElements`, `tools`; boardEditor: `selectionPanels`, `toolPanels`, `tools`
- **Points it owns:** —
- **MCP tools:** —
- **Files:** `connector.canvas.ts` (its canvas side: what `register` gives `boardCanvas`, no UI), `connector.kind.ts`, `connector.tool.ts`, `resolve-connectors.ts`, `elbow-route.ts`, `quick-connect.kind.ts` (the base of stickies and shapes), `sides.ts`, `ui/`.

## How it works

- `connector/`: `ConnectorKind extends LineKind`. Each end (`start`, `end`) is free (`x`, `y`) or attached to a connectable element (`shapeId`, optional `side`). Its route (`straight` or `elbow`, `elbow-route.ts`), bounds and `points` are derived by `resolveConnectors`, part of the board's `resolveElements` (after the ER pass), so **read connectors from the scene**. Moving one moves only its free ends; `detachConnectors` (the board's `onRemove`) frees ends whose element was deleted. Selected, it shows its ends, which drag with `ConnectorDrag` (also used by the `connector` tool). `QuickConnectKind` (the base of `StickyKind` and `GeoKind`) shows a dot beside each side that drags out a new connector.
