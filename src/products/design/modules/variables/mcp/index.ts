import type { DesignMcpTool } from "../../../mcp";
import { contrastTools } from "./contrast.mcp";
import { modesTools } from "./modes.mcp";
import { scaleTools } from "./scale.mcp";
import { shadeTools } from "./shades.mcp";
import { stylesEditTools } from "./styles-edit.mcp";
import { stylesReadTools } from "./styles-read.mcp";
import { typeScaleTools } from "./type-scale.mcp";
import { usageTools } from "./usage.mcp";
import { variablesBindTools } from "./variables-bind.mcp";
import { variablesEditTools } from "./variables-edit.mcp";
import { variablesReadTools } from "./variables-read.mcp";

/** Every variables tool. */
export const variableTools: DesignMcpTool[] = [
  ...variablesReadTools,
  ...modesTools,
  ...variablesEditTools,
  ...variablesBindTools,
  ...stylesReadTools,
  ...stylesEditTools,
  ...shadeTools,
  ...scaleTools,
  ...typeScaleTools,
  ...usageTools,
  ...contrastTools,
];
export { exchangeTools } from "./exchange.mcp";
