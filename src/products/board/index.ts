// Boards (`.cboard`, FigJam-style). Everything here is engine-side and framework-free: the
// points the board's modules plug into, its element types and modules (engine side), tools,
// palette, agent tools and file format. The React editor is in `ui/`, which also composes the
// product from the modules (`getBoardProduct`).
export type * from "./agent";
export type { BoardEngine, BoardEngineState } from "./board-engine.types";
export type { BoardToolOptions } from "./board-options.types";
export * from "./agent";
export {
  boardAgentTools,
  boardCanvas,
  boardErConstructs,
  boardErStandards,
  boardMigrations,
} from "./board-points";
export * from "./modules";
export * from "./file";
export * from "./palette";
