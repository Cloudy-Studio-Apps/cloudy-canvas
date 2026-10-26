import type { BoardMcpTool } from "../../../mcp/board-mcp.types";
import { colorsBindTools } from "./colors-bind.mcp";
import { colorsEditTools } from "./colors-edit.mcp";
import { colorsExchangeTools } from "./colors-exchange.mcp";
import { colorsReadTools } from "./colors-read.mcp";

/** The board's color tools. */
export const colorTools: BoardMcpTool[] = [
  ...colorsReadTools,
  ...colorsEditTools,
  ...colorsBindTools,
  ...colorsExchangeTools,
];
