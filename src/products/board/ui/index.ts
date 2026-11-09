// The board editor (React): the editor a `/board/:id` tab shows, its chrome and panels, file
// loading and saving, and registering the open board for agents. It's also the editor's public API: what
// modules import by path (`@board/ui/board-engine-context`, …) and plugins get as `api.board`,
// with the engine barrel (`@board`).
export type * from "./stores/board-panel-store.types";
export * from "./components/board-colors";
export * from "./components/source-editor";
export * from "./modules";
export { boardFiles, getActiveBoard } from "./agent";
export { BoardEditor } from "./board-editor";
export { useBoardEngine, useBoardState } from "./board-engine-context";
export { BoardShortcutsList } from "./components/shortcuts-list";
export {
  BOARD_FILE_FORMAT,
  boardTabLoader,
  importFigJamFile,
  importFigJamWithLoading,
} from "./file";
export { useBoardPanelStore } from "./stores/board-panel-store";
