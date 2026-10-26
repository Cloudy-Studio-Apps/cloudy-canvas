// Building blocks for the tools agents call over MCP. Products assemble their tools from these
// (e.g. `products/board/mcp`); the app serves them through `shared/core/mcp`.
export type * from "./agent-file.types";
export type * from "./agent-patches.types";
export type * from "./mcp-tool.types";
export type * from "./mcp-tool-group.types";
export type * from "./arrange.mcp.types";
export type * from "./element-summary.types";
export { agentPatches } from "./agent-patches";
export { arrangeTools } from "./arrange.mcp";
export { asUndoStep } from "./as-undo-step";
export { buildElement, creatableTypes, elementSpec } from "./build-element";
export { collectMcpTools } from "./collect-mcp-tools";
export { elementPatch } from "./element-patch";
export { summarizeElement } from "./element-summary";
export { exportPath } from "./export-path";
export * from "./tool-args";
export * from "./tokens";
