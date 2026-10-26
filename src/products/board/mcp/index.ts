// The board's MCP plumbing: the host tools reach, the instructions, collecting the modules' tool
// groups, and helpers they share. The general tools are the core module's (`modules/core/mcp/`).
export type * from "./board-mcp.types";
export { BOARD_MCP_INSTRUCTIONS } from "./mcp-instructions";
export { createBoardMcpTools } from "./create-mcp-tools";
export { requireBoard, requireShapes } from "./board-access";
export { reportApplied } from "./apply-result";
