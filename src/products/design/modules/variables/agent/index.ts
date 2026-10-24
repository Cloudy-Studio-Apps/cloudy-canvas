import type { DesignAgentTool } from "../../../agent";
import { modesTools } from "./modes.agent-tools";
import { scaleTools } from "./scale.agent-tools";
import { shadeTools } from "./shades.agent-tools";
import { styleTools } from "./styles.agent-tools";
import { variablesBindTools } from "./variables-bind.agent-tools";
import { variablesEditTools } from "./variables-edit.agent-tools";
import { variablesReadTools } from "./variables-read.agent-tools";

/** Every variables tool. */
export const variableTools: DesignAgentTool[] = [
  ...variablesReadTools,
  ...modesTools,
  ...variablesEditTools,
  ...variablesBindTools,
  ...styleTools,
  ...shadeTools,
  ...scaleTools,
];
