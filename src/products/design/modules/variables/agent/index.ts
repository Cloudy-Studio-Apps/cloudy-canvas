import type { DesignAgentTool } from "../../../agent";
import { contrastTools } from "./contrast.agent-tools";
import { modesTools } from "./modes.agent-tools";
import { scaleTools } from "./scale.agent-tools";
import { shadeTools } from "./shades.agent-tools";
import { stylesEditTools } from "./styles-edit.agent-tools";
import { stylesReadTools } from "./styles-read.agent-tools";
import { typeScaleTools } from "./type-scale.agent-tools";
import { usageTools } from "./usage.agent-tools";
import { variablesBindTools } from "./variables-bind.agent-tools";
import { variablesEditTools } from "./variables-edit.agent-tools";
import { variablesReadTools } from "./variables-read.agent-tools";

/** Every variables tool. */
export const variableTools: DesignAgentTool[] = [
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
