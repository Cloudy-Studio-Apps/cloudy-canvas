import {
  collectMcpTools,
  filesTools,
  pluginsTools,
  tabsTools,
  type CollectedMcpTool,
  type McpToolGroup,
} from "@canvas";
import type { AgentCallHost } from "./agent-server-definition.types";

/** The shared groups whose tools need no open file, whichever product. */
const APP_GROUPS: McpToolGroup<AgentCallHost, unknown>[] = [tabsTools, filesTools, pluginsTools];

/** Their topics, which no plugin id may take. */
export const APP_PREFIXES: string[] = APP_GROUPS.flatMap((group) =>
  group.prefix === undefined ? [] : [group.prefix],
);

/**
 * The app tools with their full names (`tabs_list`, `file_open`, `plugins_list`), checked like any
 * built-in module's: an invalid or taken name throws.
 */
export function appTools(): CollectedMcpTool<AgentCallHost>[] {
  return collectMcpTools(
    APP_GROUPS,
    undefined,
    (group) => ({ moduleId: group.id, tier: "core", pluginId: undefined }),
    new Set(),
  ).tools;
}
