import { HandTool } from "./hand-tool";
import { ScaleTool } from "./scale-tool";
import { SelectTool } from "./select-tool";
import type { Tool, ToolContext } from "./tool.types";

/**
 * The tools every canvas has (the Scale tool's key is the product's). Products add theirs with
 * `CanvasProduct.createTools`.
 */
export function createBaseTools(ctx: ToolContext): Tool[] {
  return [new SelectTool(ctx), new ScaleTool(ctx), new HandTool(ctx)];
}
