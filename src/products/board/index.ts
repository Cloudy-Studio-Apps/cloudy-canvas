// Boards (`.cboard`, FigJam-style). Everything here is engine-side and framework-free: the
// points the board's modules plug into, its element types and modules (engine side), tools,
// palette, agent tools and file format. The React editor is in `ui/`, which also composes the
// product from the modules (`getBoardProduct`).
export type * from "./mcp";
export type { BoardEngine, BoardEngineState, BoardWorkspace } from "./board-engine.types";
export type { BoardToolOptions } from "./board-options.types";
export * from "./mcp";
export { boardMcpTools, boardCanvas, boardMigrations } from "./board-points";
export * from "./modules";
export * from "./file";
export * from "./palette";
export * from "./tokens";
