// Boards (`.cboard`, FigJam-style). Everything here is engine-side and framework-free: the
// product definition the engine is created with, its element types, tools, palette, agent tools
// and file format. The React editor is in `ui/`.
export type * from "./agent";
export type { BoardEngine, BoardEngineState } from "./board-engine.types";
export type { BoardToolOptions } from "./board-options.types";
export type * from "./stickers";
export { AGENT_INSTRUCTIONS, createAgentTools } from "./agent";
export { BOARD_KEYBINDINGS } from "./board-keybindings";
export { DEFAULT_BOARD_OPTIONS } from "./board-options";
export { boardProduct } from "./board-product";
export * from "./elements";
export * from "./file";
export * from "./palette";
export * from "./stickers";
