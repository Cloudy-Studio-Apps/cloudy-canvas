import { HandTool } from "./hand-tool";
import { MarkerTool } from "./marker-tool";
import { SelectTool } from "./select-tool";
import { ShapeTool } from "./shape-tool";
import { StickyTool } from "./sticky-tool";
import type { Tool, ToolContext, ToolId } from "./tool.types";

/** Tool registry. Adding a tool means adding its id to TOOL_IDS and its constructor here. */
export function createTools(ctx: ToolContext): Record<ToolId, Tool> {
  return {
    select: new SelectTool(ctx),
    hand: new HandTool(ctx),
    marker: new MarkerTool(ctx),
    sticky: new StickyTool(ctx),
    shape: new ShapeTool(ctx),
  };
}
