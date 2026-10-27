import type { CanvasElement, ToolContext } from "@canvas";

import type { BoardToolOptions } from "../../../board-options.types";
import { isErElement } from "../base/is-er-element";
import { ER_MODE_ID } from "./er-mode.constants";

/**
 * The er module's `editElement`: double-clicking (or Enter on) an ER shape enters the ER mode with
 * it selected. Inside the mode it falls through, so double-click renames as usual.
 */
export function enterErMode(el: CanvasElement, ctx: ToolContext<BoardToolOptions>): boolean {
  if (!isErElement(el) || ctx.getMode() === ER_MODE_ID) return false;
  ctx.setMode(ER_MODE_ID);
  ctx.setSelection([el.id]);
  return true;
}
