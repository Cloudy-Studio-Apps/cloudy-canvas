/** Who contributed an MCP tool group, which decides its tools' prefix. */
export interface McpToolOwner {
  /** The module that contributed the group. */
  moduleId: string;
  /** The module's tier; plugins' modules have none. */
  tier: "core" | "feature" | undefined;
  /** The plugin the module belongs to, if any. */
  pluginId: string | undefined;
}

/** The prefix a group's tools take, or why a plugin's group is refused. */
export type McpPrefixResult = { prefix: string } | { refused: string };
