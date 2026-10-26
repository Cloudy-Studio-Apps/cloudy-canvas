// Tables: grids of text cells. The module (`table.module.ts`) registers the kind, the tool (G)
// and its panel.
export type * from "./table.types";
export type * from "./table.layout.types";
export type * from "./table-options.types";
export { createTable } from "./table.factory";
export { TableKind } from "./table.kind";
export { TABLE_DEFAULTS } from "./table.defaults";
export { isTable } from "./is-table";
export { bindCells, cellFillPath } from "./table-cell-bindings";
export { fillCells, insertLine, removeLine } from "./table-edits";
export { linePart, parseTablePart, partCells } from "./table-parts";
export { TableTool } from "./table.tool";
