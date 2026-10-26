import type { BoardMcpTool } from "../../../mcp/board-mcp.types";

/** What's installed beyond the built-ins. */
export const pluginTools: BoardMcpTool[] = [
  {
    name: "list_plugins",
    description:
      "The plugins installed in the app: id, name, version, whether each is enabled, disabled or " +
      "failed (with the error), and the agent tools it adds. Plugins are installed and enabled by " +
      "the user in Settings › Plugins; changes apply after the app reloads.",
    inputSchema: { type: "object", properties: {} },
    run: (host) => host.plugins(),
  },
];
