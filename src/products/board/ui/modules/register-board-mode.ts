import { registerEditorMode } from "@canvas-ui";
import { boardCanvas } from "@board";
import type { ModuleHost } from "@shared/core";
import { boardEditor } from "./board-editor-points";
import type { BoardModeDefinition } from "./board-mode.types";

/** A board mode written as one object (it's returned as is; the type checks it). */
export function defineBoardMode(mode: BoardModeDefinition): BoardModeDefinition {
  return mode;
}

/** Registers a board mode into the board's points (see `registerEditorMode`). */
export function registerBoardMode(host: ModuleHost, mode: BoardModeDefinition): void {
  registerEditorMode(host, { canvas: boardCanvas, editor: boardEditor }, mode);
}
