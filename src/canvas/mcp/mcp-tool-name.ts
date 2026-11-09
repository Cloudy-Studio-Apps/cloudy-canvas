/** The longest full tool name: agent apps add their own prefix (e.g. `mcp__cloudy-canvas__`). */
export const MCP_TOOL_NAME_MAX = 44;

const NAME_CHARS = /^[a-z0-9][a-z0-9_-]*$/;

/** Why a full tool name can't be served, in English, or `null` when it's valid. */
export function checkMcpToolName(name: string): string | null {
  if (!NAME_CHARS.test(name))
    return `"${name}" must start with a-z or 0-9 and use only a-z, 0-9, "_" and "-".`;
  if (name.length > MCP_TOOL_NAME_MAX) {
    return `"${name}" is longer than ${MCP_TOOL_NAME_MAX} characters.`;
  }
  return null;
}

/** A tool's full name: its owner's prefix, then its local name (`auto-layout_add`). */
export function mcpToolName(prefix: string, local: string): string {
  return `${prefix}_${local}`;
}
