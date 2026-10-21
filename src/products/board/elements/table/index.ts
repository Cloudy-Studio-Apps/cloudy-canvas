export type * from "./table.types";
export type * from "./table.layout.types";
export { createTable } from "./table.factory";
export { TableKind } from "./table.kind";
export { TABLE_DEFAULTS } from "./table.defaults";
export { isTable } from "./is-table";
export { fillCells, insertLine, removeLine } from "./table-edits";
export { linePart, parseTablePart, partCells } from "./table-parts";
