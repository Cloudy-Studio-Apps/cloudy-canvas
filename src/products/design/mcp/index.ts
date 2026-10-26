// The design's plumbing for agents (MCP): the host the app implements, the open design's access
// helpers and the collector of the tools the design's modules contribute (`designMcpTools`).
export type * from "./design-mcp.types";
export { DESIGN_MCP_INSTRUCTIONS } from "./mcp-instructions";
export { createDesignMcpTools } from "./create-mcp-tools";
export { optionalNodeIds, requireDesign, requireNodes } from "./design-access";
