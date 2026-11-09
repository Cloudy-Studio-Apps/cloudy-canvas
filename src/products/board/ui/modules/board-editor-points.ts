import { createEditorPoints } from "@canvas-ui";
import { definePoint } from "@shared/core";

import type { BoardEditorPoints } from "./board-editor-points.types";

/** The points the board editor's UI is assembled from (toolbar, panels, top bar, main menu, …). */
export const boardEditor: BoardEditorPoints = {
  ...createEditorPoints("board"),
  mainMenu: definePoint("board.editor.mainMenu", { keyOf: (group) => group.id }),
};
