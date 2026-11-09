// The name, description and arguments of the tools boards and designs share (one tool listed for
// both, run on the product of the agent's tab); each product adds its own `run`.
export type * from "./shared-tool.types";
export { CLIPBOARD_PNG_COPY_TOOL } from "./clipboard.specs";
export { FILE_GET_TOOL, FILE_INFO_SET_TOOL, FILE_SAVE_TOOL } from "./file.specs";
export { HISTORY_REDO_TOOL, HISTORY_UNDO_TOOL } from "./history.specs";
export { SELECTION_GET_TOOL, SELECTION_SET_TOOL } from "./selection.specs";
export { STICKER_STAMP_TOOL } from "./sticker.specs";
export {
  VIEW_FIT_ELEMENTS_TOOL,
  VIEW_FIT_TOOL,
  VIEW_SNAPSHOT_MAX_SIDE,
  VIEW_SNAPSHOT_TOOL,
} from "./view.specs";
