import { ConnectorTool } from "./connector-tool";
import { DbTool } from "./db-tool";
import { ErTool } from "./er-tool";
import { HandTool } from "./hand-tool";
import { MarkerTool } from "./marker-tool";
import { SelectTool } from "./select-tool";
import { SectionTool } from "./section-tool";
import { ShapeTool } from "./shape-tool";
import { StickyTool } from "./sticky-tool";
import { TextTool } from "./text-tool";
import type { Tool, ToolContext, ToolId } from "./tool.types";

/** Tool registry. Adding a tool means adding its id to TOOL_IDS and its constructor here. */
export function createTools(ctx: ToolContext): Record<ToolId, Tool> {
  return {
    select: new SelectTool(ctx),
    hand: new HandTool(ctx),
    marker: new MarkerTool(ctx),
    sticky: new StickyTool(ctx),
    text: new TextTool(ctx),
    shape: new ShapeTool(ctx),
    connector: new ConnectorTool(ctx),
    section: new SectionTool(ctx),
    db: new DbTool(ctx),
    er: new ErTool(ctx),
  };
}
