import type { BoardAgentTool } from "../../../agent/board-agent.types";
import { colorsBindTools } from "./colors-bind.agent-tools";
import { colorsEditTools } from "./colors-edit.agent-tools";
import { colorsExchangeTools } from "./colors-exchange.agent-tools";
import { colorsReadTools } from "./colors-read.agent-tools";

/** The board's color tools. */
export const colorTools: BoardAgentTool[] = [
  ...colorsReadTools,
  ...colorsEditTools,
  ...colorsBindTools,
  ...colorsExchangeTools,
];
