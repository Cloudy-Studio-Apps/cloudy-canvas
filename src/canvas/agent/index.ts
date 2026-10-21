// Building blocks for the tools agents call over MCP. Products assemble their tools from these
// (e.g. `products/board/agent`); the app serves them through `shared/core/mcp`.
export type * from "./agent-patches.types";
export type * from "./agent-tool.types";
export type * from "./element-summary.types";
export { agentPatches } from "./agent-patches";
export { asUndoStep } from "./as-undo-step";
export { buildElement, creatableTypes } from "./build-element";
export { elementPatch } from "./element-patch";
export { summarizeElement } from "./element-summary";
export * from "./tool-args";
