import { HandTool } from "./hand-tool";
import { SelectTool } from "./select-tool";
import type { Tool, ToolContext } from "./tool.types";

/** The tools every canvas has. Products add theirs with `CanvasProduct.createTools`. */
export function createBaseTools(ctx: ToolContext): Tool[] {
  return [new SelectTool(ctx), new HandTool(ctx)];
}
