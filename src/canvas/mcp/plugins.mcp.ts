import type { FilesAgentHost } from "./files.mcp.types";
import type { McpToolGroup } from "./mcp-tool-group.types";

/** The plugins tool, for either product (`plugins_list`). */
export const pluginsTools: McpToolGroup<FilesAgentHost, unknown> = {
  id: "plugins",
  prefix: "plugins",
  tools: () => [
    {
      name: "list",
      scope: "app",
      description:
        "The plugins installed in the app: id, name, version, whether each is enabled, disabled " +
        "or failed (with the error), and the agent tools it adds. Plugins are installed and " +
        "enabled by the user in Settings › Plugins; changes apply after the app reloads.",
      inputSchema: { type: "object", properties: {} },
      run: (host) => host.plugins(),
    },
  ],
};
