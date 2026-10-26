# Booleans

Union, subtract, intersect and exclude (Alt+Shift+U/S/I/E) kept live as boolean groups, plus Flatten and Outline stroke, which turn layers into vectors.

- **Tier:** feature
- **Requires:** core, vector
- **Contributes:** kinds `BooleanKind`; designCanvas: `hostCommands`, `kinds`, `onMoved`, `onRemove`; designEditor: `contextMenu`, `layerIcons`, `mainMenu`, `propertySections`, `selectionActions`, `sessionHooks`; `designMcpTools`
- **Points it owns:** —
- **MCP tools:** `boolean_nodes`, `flatten_nodes`, `outline_strokes`
- **Files:** `boolean.kind.ts` (the live group), `boolean-result.ts` (the shape it draws), `boolean-nodes.ts`, `flatten-nodes.ts`, `outline-strokes.ts`, `boolean.mcp.ts`, `ui/`.

## How it works

- **Booleans** (`boolean/`, Figma's): `BooleanKind extends ChildHostKind` (`type: "boolean"`, `operation`: `union`, `subtract`, `intersect`, `exclude`) draws its operands (its children, bottom to top) combined, with its own paints, and is hit by the result; the operands aren't drawn (`drawsChildren` false) but stay selectable (double-click enters) and editable. `resolveBoolean` (its `resolveFromChildren`) combines each visible operand's `operandShape` (its fill, or its outlined strokes when it fills nothing; a group's layers' union; nested booleans' results) with `booleanPaths`, relative to the first operand and cached in an LRU by `operandKey`s (shape keys and relative placements), so moving them together only moves the result; the geometry is kept per resolved element (`booleanGeometry`), never stored. `booleanNodes` (Alt+Shift+U/S/I/E, `booleanUnion`…; one selected boolean changes operation, otherwise two or more layers (booleans nest) are wrapped in a boolean named after it and painted like the bottom one), `flattenNodes` (`flatten`, Ctrl+E: one vector of the selection's shapes, `pathToNetwork`, one layer keeps its id and turn; text becomes its glyphs) and `outlineStrokes` (`outlineStroke`, Ctrl+Shift+O: strokes become a filled vector above the layer, or replace a layer without fills) run in one undo step each (`useBooleanCommands`). The Boolean main menu and context menu group, the Boolean section (for booleans their operation; for two or more other layers the four operations that combine them; Flatten), layer icons per operation (`LayerIconEntry.iconOf`) and the toolbar's boolean menu. Agents: `boolean_nodes`, `flatten_nodes`, `outline_strokes`, `operation` through `update_nodes`.
