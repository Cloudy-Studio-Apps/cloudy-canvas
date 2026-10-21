import type { ToolContext } from "./tool.types";

/** Selects a shape, returns to the select tool and opens the text editor on it. */
export function selectAndEdit(ctx: ToolContext, id: string): void {
  ctx.setSelection([id]);
  ctx.setTool("select");
  ctx.editText(id);
}
