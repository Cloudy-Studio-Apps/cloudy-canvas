import type { SharedToolSpec } from "./shared-tool.types";

const NO_ARGS = { type: "object", properties: {} };

/** `history_undo`: undoes the agent's own last step. */
export const HISTORY_UNDO_TOOL: SharedToolSpec = {
  name: "undo",
  description:
    "Undoes your last change on the open file (yours only: the user and other agents have their " +
    "own undo).",
  inputSchema: NO_ARGS,
};

/** `history_redo`: redoes the agent's own last undone step. */
export const HISTORY_REDO_TOOL: SharedToolSpec = {
  name: "redo",
  description: "Redoes your last undone change on the open file.",
  inputSchema: NO_ARGS,
};
