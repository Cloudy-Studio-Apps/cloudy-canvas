import type { CanvasEngine } from "./canvas-engine";
import { TOOL_IDS, type ToolId } from "./tools";
import type { CommandId, CommandHandler } from "./commands.types";

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
    save: () => engine.runHostAction("save"),
    saveAs: () => engine.runHostAction("saveAs"),
    ...toolCommands,
  };
}
