import type { DesignMcpTool } from "../../../mcp";
import { flowTools } from "./flows.mcp";
import { interactionTools } from "./interactions.mcp";

/** The Prototype mode's flows and the interactions that link screens. */
export const prototypeTools: DesignMcpTool[] = [...flowTools, ...interactionTools];
