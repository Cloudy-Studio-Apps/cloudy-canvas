# Vectors

Vector networks: the pen (P) and pencil (Shift+P), and the edit mode for a vector's points with its own toolbar.

- **Tier:** core
- **Requires:** core
- **Contributes:** kinds `VectorKind`; designCanvas: `editElement`, `kinds`, `tools`; designEditor: `layerIcons`, `toolbars`, `tools`; `designMcpTools`
- **Points it owns:** —
- **MCP tools:** `convert_to_vector`
- **Files:** `vector.kind.ts`, `pencil.tool.ts`, `shape-to-vector.ts`, `edit/` (the edit mode), `vector.mcp.ts`, `ui/`.

## How it works

- **Vectors** (`vector/`): `VectorKind` (`network`; old pencil `points` become a chain in `fillDefaults`): regions filled, segments stroked, hit near a segment or inside a filled region, stretched when resized. `PencilTool` (Shift+P, a `FreehandTool`) draws chains; the pen and the pencil share the toolbar's `draw` menu. **Edit mode** (`vector/edit/`): `editVector` (the `editElement` hook) starts it on a vector, or first turns a shape with a `vectorNetwork` into a vector with the same id and look (one undo step). `VECTOR_EDIT` (`VectorEditSession`) holds the edited vector and the selected points and segments. Every edit tool extends `VectorEditTool` (the overlay `drawVectorOverlay` as a guide, `partAt` for handles, points and segments, `write`/`commit` through `placeNetwork`, only Enter (Done) leaves, Esc lets go of the selected points, V is Move points and other tool shortcuts wait, Delete removes parts, Ctrl+A selects all points): `VectorMoveTool` (`vector-move`: pick, Shift, marquee, drag points, segments and handles, Alt breaks the mirror, a click away lets go of the points), `PenTool` (`pen`, P: starts a vector outside the mode; adds points joined to the selected end, pulling handles while dragging; splits segments; joins points, closing loops into regions; Esc lets go of the end), `VectorBendTool` (curve a segment through the pointer, click a point to toggle smooth), `VectorBucketTool` (`vector-bucket`: click an enclosed area to fill or unfill it; a vector without fills gets the default gray) and `VectorCutTool`. `VectorEditToolbar` (Move, Pen, Bend, Paint bucket, Cut, Done = Enter) is contributed to `toolbars`.
