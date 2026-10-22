// Building blocks for the tools agents call over MCP. Products assemble their tools from these
// (e.g. `products/board/agent`); the app serves them through `shared/core/mcp`.
export type * from "./agent-file.types";
export type * from "./agent-patches.types";
export type * from "./agent-tool.types";
export type * from "./agent-tool-group.types";
export type * from "./element-summary.types";
export { agentPatches } from "./agent-patches";
export { asUndoStep } from "./as-undo-step";
export { buildElement, creatableTypes, elementSpec } from "./build-element";
export { collectAgentTools } from "./collect-agent-tools";
export { elementPatch } from "./element-patch";
export { summarizeElement } from "./element-summary";
export { exportPath } from "./export-path";
export * from "./tool-args";
