import { isFileCandidates, SEVERAL_FILES_MATCH } from "./agent-tabs";
import type { TabsAgentHost } from "./agent-tabs.types";
import type { McpToolGroup } from "./mcp-tool-group.types";
import { stringArg } from "./tool-args";

/**
 * The tools for the user's open tabs, whichever product: listing them and moving to one
 * (`tabs_list`, `tabs_switch`). Opening and creating files are `file_open` and `file_new`.
 */
export const tabsTools: McpToolGroup<TabsAgentHost, unknown> = {
  id: "tabs",
  prefix: "tabs",
  tools: () => [
    {
      name: "list",
      scope: "app",
      description:
        "The tabs the user has open in Cloudy Canvas: each tab's name, type (board or design), " +
        "whether you work in it (mine) and the names of the agents working in it. It never changes " +
        "anything and shows no content.",
      inputSchema: { type: "object", properties: {} },
      run: async (host) => ({ tabs: await host.tabs() }),
    },
    {
      name: "switch",
      scope: "app",
      description:
        "Moves you to an open tab by its name (from tabs_list, case-insensitive); the user's view " +
        "doesn't change. If several tabs have that name, nothing changes and you get the " +
        "candidates: ask the user which one.",
      inputSchema: {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string", description: "The name of an open tab." } },
      },
      run: async (host, args) => {
        const moved = await host.switchTab(stringArg(args, "name"));
        return isFileCandidates(moved)
          ? { message: SEVERAL_FILES_MATCH, candidates: moved.candidates }
          : { ...moved, message: `You now work in the tab "${moved.name}".` };
      },
    },
  ],
};
