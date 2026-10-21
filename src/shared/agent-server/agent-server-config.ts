/** One-line setup for Claude Code. */
export function claudeCodeCommand(url: string): string {
  return `claude mcp add --transport http cloudy-canvas ${url}`;
}

/** `mcpServers` entry for agents configured with JSON (Claude Desktop, Cursor, `.mcp.json`). */
export function mcpJsonConfig(url: string): string {
  return JSON.stringify({ mcpServers: { "cloudy-canvas": { type: "http", url } } }, null, 2);
}
