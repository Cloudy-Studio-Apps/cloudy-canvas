// The board editor (React): the page at `/board/:id`, its chrome and panels, file loading and
// saving, and registering the open board for agents.
export { getActiveBoard, setActiveBoard, waitForActiveBoard } from "./agent";
export { BoardEditorPage } from "./board-editor-page";
export { BoardShortcutsList } from "./components/shortcuts-list";
export {
  boardEditor,
  getBoardEditorModules,
  getBoardModules,
  getBoardProduct,
  registerBoardModule,
} from "./modules";
