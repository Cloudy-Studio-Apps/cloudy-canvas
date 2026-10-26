# Tables

Tables (G) with a header, tinted rows and cell fills, rows and columns added and moved on the canvas.

- **Tier:** feature
- **Requires:** —
- **Contributes:** kinds `TableKind`; boardCanvas: `kinds`, `options`, `tools`; boardEditor: `selectionPanels`, `toolPanels`, `tools`
- **Points it owns:** —
- **MCP tools:** —
- **Files:** `table.kind.ts`, `table.layout.ts`, `table.draw.ts`, `table-edits.ts`, `table.handles.ts`, `table.interactions.ts`, `ui/`.

## How it works

- `table/`: `TableKind extends BoxKind`, a grid of cells (`columns` widths, `rows` heights, `cells[row][column]`, `fills[row][column]` per-cell colors (`""` for none), `header`, `color` the header tint). Rows grow to fit their text (`fitRows`); every grid edit is a patch builder in `table-edits.ts` (`insertLine`, `removeLine`, `moveLine`, `resizeLine`, `scaleTable`, `gridFromCells`) that also returns the bounds. Cells are text parts (`"r:c"`, `table-parts.ts`); selected, it shows "+" strips (add a row/column), grips (`"row:i"`/`"column:j"` parts, dragged to reorder with `TableReorderGesture`) and resizable grid lines (`TableLineGesture`). Clicking a cell of a selected table selects it (Enter edits it, Delete clears it); Shift-click selects the block from the first selected cell, Ctrl/Cmd-click adds or removes one (`clickedCells`; several cells are one part, `"0:0,0:1"`). The options panel (`table-options.tsx`) picks the header and its tint, or, with a cell, row or column selected, its fill (`table-cell-fills.tsx`, `fillCells`), and inserts or deletes the selected row or column. `useEngineElement(id)` (`canvas-ui`) re-reads an element as it changes. Agents create it with `cells`, `header` and `fills` (`table-args.ts`), and patch those, `w`/`h` (scaled with `scaleTable`) and `color`.
