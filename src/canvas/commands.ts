import { NUDGE_STEPS, type Alignment } from "./arrange";
import type { CanvasEngine } from "./canvas-engine";
import type { CommandHandler, Commands } from "./commands.types";

/** The align commands and the line each one lines the selection up on. */
const ALIGN_COMMANDS: Record<string, Alignment> = {
  alignLeft: "left",
  alignCenterX: "centerX",
  alignRight: "right",
  alignTop: "top",
  alignCenterY: "centerY",
  alignBottom: "bottom",
};

/**
 * Named engine actions, shared by keyboard shortcuts and any host UI that wants to trigger them.
 * Every tool gets a `tool.<id>` command, so a product's tools are reachable from its keymap, and
 * each of the product's host commands runs the host's handler for it. The active tool is asked
 * first (`Tool.onCommand`), then the current mode (`CanvasMode.commands`).
 */
export function createCommands(
  engine: CanvasEngine,
  toolIds: readonly string[],
  hostCommands: readonly string[],
): Commands {
  const toolCommands: Record<string, CommandHandler> = {};
  for (const id of toolIds) toolCommands[`tool.${id}`] = () => engine.setTool(id);
  for (const id of hostCommands) toolCommands[id] = () => engine.runHostAction(id);
  for (const [id, step] of Object.entries(NUDGE_STEPS))
    toolCommands[id] = () => engine.nudgeSelection(step.x, step.y);
  for (const [id, alignment] of Object.entries(ALIGN_COMMANDS))
    toolCommands[id] = () => engine.alignSelection(alignment);

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
    copyProperties: () => engine.copyStyle(),
    pasteProperties: () => engine.pasteStyle().length > 0,
    duplicate: () => engine.duplicateSelection(),
    bringToFront: () => engine.reorderSelection("front"),
    bringForward: () => engine.reorderSelection("forward"),
    sendBackward: () => engine.reorderSelection("backward"),
    sendToBack: () => engine.reorderSelection("back"),
    distributeHorizontal: () => engine.distributeSelection("x"),
    distributeVertical: () => engine.distributeSelection("y"),
    tidyUp: () => engine.tidyUpSelection(),
    rotateLeft: () => engine.rotateSelection(90),
    rotateRight: () => engine.rotateSelection(-90),
    toggleLock: () => engine.toggleLockSelection(),
    unlockAll: () => engine.unlockAll(),
    editSelection: () => engine.editSelection(),
    cancel: () => engine.cancel(),
    zoomIn: () => engine.zoomIn(),
    zoomOut: () => engine.zoomOut(),
    zoomReset: () => engine.zoomTo(1),
    zoomToFit: () => engine.zoomToFit(),
    centerOrigin: () => engine.centerOrigin(),
    zoomToSelection: () => engine.zoomToSelection(),
    nextFrame: () => engine.zoomToFrame(1),
    previousFrame: () => engine.zoomToFrame(-1),
    save: () => engine.runHostAction("save"),
    saveAs: () => engine.runHostAction("saveAs"),
    export: () => engine.runHostAction("export"),
    ...toolCommands,
  };
  // The active tool may take any command first (see `Tool.onCommand`); the others run only when
  // the current mode allows them (see `CanvasMode.commands`).
  return Object.fromEntries(
    Object.entries(commands).map(([id, handler]) => [
      id,
      () => (engine.toolTakes(id) ? true : engine.allowsCommand(id) ? handler() : false),
    ]),
  );
}
