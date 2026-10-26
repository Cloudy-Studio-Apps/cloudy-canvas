# Connector (Board module)

_How it works. The rules are in the root [CLAUDE.md](../../../../../CLAUDE.md); names may still follow the pre-refactor conventions until their phase (see its Transition table)._

## Connector

- `connector/`: `ConnectorKind extends LineKind`. Each end (`start`, `end`) is free (`x`, `y`) or attached to a connectable element (`shapeId`, optional `side`). Its route (`straight` or `elbow`, `elbow-route.ts`), bounds and `points` are derived by `resolveConnectors`, part of the board's `resolveElements` (after the ER pass), so **read connectors from the scene**. Moving one moves only its free ends; `detachConnectors` (the board's `onRemove`) frees ends whose element was deleted. Selected, it shows its ends, which drag with `ConnectorDrag` (also used by the `connector` tool). `QuickConnectKind` (the base of `StickyKind` and `GeoKind`) shows a dot beside each side that drags out a new connector.
