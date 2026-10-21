import type { ToolId } from "./tools";

export type CommandId =
  | "undo"
  | "redo"
  | "selectAll"
  | "deleteSelection"
  | "editSelection"
  | "cancel"
  | "zoomIn"
  | "zoomOut"
  | "zoomReset"
  | "zoomToFit"
  | `tool.${ToolId}`;

/** Runs a command. Returns `false` when there was nothing to do, so the key event isn't consumed. */
export type CommandHandler = () => boolean | void;
