import type { DesignAgentTool } from "../../../agent";
import { styleguideEditTools } from "./styleguide-edit.agent-tools";
import { styleguideOutputTools } from "./styleguide-output.agent-tools";
import { styleguideReadTools } from "./styleguide-read.agent-tools";
import type { StyleguideToolSources } from "./styleguide-agent.types";

export type { StyleguideToolSources } from "./styleguide-agent.types";

/** Every Design system tool. */
export function styleguideTools(sources: StyleguideToolSources): DesignAgentTool[] {
  return [
    ...styleguideReadTools(sources),
    ...styleguideOutputTools(sources),
    ...styleguideEditTools(sources),
  ];
}
