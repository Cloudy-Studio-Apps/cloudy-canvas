import { SelectTool, type ToolContext } from "@canvas";

import type { BoardToolOptions } from "../../../board-options.types";
import { isErElement } from "../base/is-er-element";

/** The ER mode's tool id (the editor's ER toolbar and palette key on it). */
export const ER_MODE_TOOL = "er-mode";

/**
 * The ER mode: the select tool with the board's ER diagrams isolated. Everything else is dimmed
 * and can't be selected or moved, the toolbar becomes the ER one and the palette and ER panel stay
 * open. Other tools' shortcuts wait; Esc (with nothing selected) or Done leaves it.
 */
export class ErModeTool extends SelectTool {
  override readonly id = ER_MODE_TOOL;
  override readonly cursor = "default";

  constructor(private readonly mode: ToolContext<BoardToolOptions>) {
    super(mode);
  }

  onActivate(): void {
    this.mode.setIsolation(isErElement);
  }

  onCommand(command: string): boolean {
    // Switching tools would leave the mode by surprise; Done and Esc leave it on purpose.
    return command.startsWith("tool.");
  }
}
