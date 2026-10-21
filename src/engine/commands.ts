import type { CanvasEngine } from "./canvas-engine";
import { TOOL_IDS, type ToolId } from "./tools";

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

/** Named engine actions, shared by keyboard shortcuts and any host UI that wants to trigger them. */
export function createCommands(engine: CanvasEngine): Record<CommandId, CommandHandler> {
  const toolCommands = Object.fromEntries(
    TOOL_IDS.map((id) => [`tool.${id}`, () => engine.setTool(id)]),
  ) as Record<`tool.${ToolId}`, CommandHandler>;

  return {
    undo: () => engine.undo(),
    redo: () => engine.redo(),
    selectAll: () => engine.selectAll(),
    deleteSelection: () => engine.deleteSelection(),
    editSelection: () => engine.editSelection(),
    cancel: () => engine.cancel(),
    zoomIn: () => engine.zoomIn(),
    zoomOut: () => engine.zoomOut(),
    zoomReset: () => engine.zoomTo(1),
    zoomToFit: () => engine.zoomToFit(),
    ...toolCommands,
  };
}
