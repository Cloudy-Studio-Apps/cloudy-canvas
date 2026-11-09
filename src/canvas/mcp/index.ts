// Building blocks for the tools agents call over MCP. Products assemble their tools from these
// (e.g. `products/board/mcp`); the app serves them through `shared/core/mcp`.
export type * from "./agent-file.types";
export type * from "./agent-patches.types";
export type * from "./agent-tabs.types";
export type * from "./files.mcp.types";
export type * from "./plugins.mcp.types";
export type * from "./mcp-tool.types";
export type * from "./mcp-tool-group.types";
export type * from "./mcp-prefix.types";
export type * from "./collect-mcp-tools.types";
export type * from "./arrange.mcp.types";
export type * from "./element-summary.types";
export { agentPatches } from "./agent-patches";
export {
  ASK_ABOUT_PROJECT,
  SEVERAL_FILES_MATCH,
  fileRefArg,
  isFileCandidates,
  isProjectChoice,
  nameKey,
  newFileArgs,
  projectNameMatches,
  sameFileName,
} from "./agent-tabs";
export { tabsTools } from "./tabs.mcp";
export { filesTools } from "./files.mcp";
export { pluginsTools } from "./plugins.mcp";
export { arrangeTools } from "./arrange.mcp";
export { copyPropertiesTool } from "./style.mcp";
export * from "./shared";
export { SHARED_MCP_INSTRUCTIONS } from "./mcp-instructions";
export { asUndoStep } from "./as-undo-step";
export { buildElement, creatableTypes, elementSpec } from "./build-element";
export { builtInPrefixes } from "./built-in-prefixes";
export { collectMcpTools } from "./collect-mcp-tools";
export { mcpPrefixFor } from "./mcp-prefix";
export { sameSchema } from "./same-schema";
export { checkMcpToolName, MCP_TOOL_NAME_MAX, mcpToolName } from "./mcp-tool-name";
export { mcpToolOwner } from "./mcp-tool-owner";
export { elementPatch } from "./element-patch";
export { summarizeElement } from "./element-summary";
export { exportPath } from "./export-path";
export { PDF_ARG_SCHEMA, pdfArg } from "./pdf-args";
export * from "./tool-args";
export * from "./tokens";
