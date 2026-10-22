import type { CanvasEngine } from "./canvas-engine";
import type { CommandHandler, Commands } from "./commands.types";

/**
 * Named engine actions, shared by keyboard shortcuts and any host UI that wants to trigger them.
 * Every tool gets a `tool.<id>` command, so a product's tools are reachable from its keymap, and
 * each of the product's host commands runs the host's handler for it. The active tool is asked
 * first (`Tool.onCommand`).
 */
export function createCommands(
  engine: CanvasEngine,
  toolIds: readonly string[],
  hostCommands: readonly string[],
): Commands {
  const toolCommands: Record<string, CommandHandler> = {};
  for (const id of toolIds) toolCommands[`tool.${id}`] = () => engine.setTool(id);
  for (const id of hostCommands) toolCommands[id] = () => engine.runHostAction(id);

  const commands: Record<string, CommandHandler> = {
    undo: () => engine.undo(),
    redo: () => engine.redo(),
    selectAll: () => engine.selectAll(),
    deleteSelection: () => engine.deleteSelection(),
    copy: () => engine.copySelection(),
    cut: () => engine.cutSelection(),
    paste: () => engine.paste(),
    pasteToReplace: () => engine.pasteToReplace(),
    copyAsPng: () => engine.runHostAction("copyAsPng"),
    duplicate: () => engine.duplicateSelection(),
    bringToFront: () => engine.reorderSelection("front"),
    bringForward: () => engine.reorderSelection("forward"),
    sendBackward: () => engine.reorderSelection("backward"),
    sendToBack: () => engine.reorderSelection("back"),
    toggleLock: () => engine.toggleLockSelection(),
    unlockAll: () => engine.unlockAll(),
    editSelection: () => engine.editSelection(),
    cancel: () => engine.cancel(),
    zoomIn: () => engine.zoomIn(),
    zoomOut: () => engine.zoomOut(),
    zoomReset: () => engine.zoomTo(1),
    zoomToFit: () => engine.zoomToFit(),
    save: () => engine.runHostAction("save"),
    saveAs: () => engine.runHostAction("saveAs"),
    export: () => engine.runHostAction("export"),
    ...toolCommands,
  };
  // The active tool may take any command first (see `Tool.onCommand`).
  return Object.fromEntries(
    Object.entries(commands).map(([id, handler]) => [
      id,
      () => (engine.toolTakes(id) ? true : handler()),
    ]),
  );
}
