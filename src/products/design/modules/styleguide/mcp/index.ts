import type { DesignMcpTool } from "../../../mcp";
import { styleguideEditTools } from "./styleguide-edit.mcp";
import { styleguideOutputTools } from "./styleguide-output.mcp";
import { styleguideReadTools } from "./styleguide-read.mcp";
import type { StyleguideToolSources } from "./styleguide-mcp.types";

export type { StyleguideToolSources } from "./styleguide-mcp.types";

/** Every Design system tool. */
export function styleguideTools(sources: StyleguideToolSources): DesignMcpTool[] {
  return [
    ...styleguideReadTools(sources),
    ...styleguideOutputTools(sources),
    ...styleguideEditTools(sources),
  ];
}
