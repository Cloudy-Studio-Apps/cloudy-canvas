// The design's plumbing for agents (MCP): the host the app implements, the open design's access
// helpers and the collector of the tools the design's modules contribute (`designAgentTools`).
export type * from "./design-agent.types";
export { DESIGN_AGENT_INSTRUCTIONS } from "./design-agent-instructions";
export { createDesignAgentTools } from "./create-design-agent-tools";
export { optionalNodeIds, requireDesign, requireNodes } from "./design-access";
