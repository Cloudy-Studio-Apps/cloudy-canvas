import type { AgentClient } from "./agent-clients.types";

/** The name agents list the server under. */
const SERVER_NAME = "cloudy-canvas";

function jsonSnippet(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

/** The agent apps the menus give setups for, the most used first. */
export const AGENT_CLIENTS: readonly AgentClient[] = [
  {
    id: "claude-code",
    label: "Claude Code",
    snippetLabel: "Terminal command",
    where: "Run it in a terminal.",
    snippet: (url) => `claude mcp add --transport http ${SERVER_NAME} ${url}`,
  },
  {
    id: "claude-desktop",
    label: "Claude Desktop",
    snippetLabel: "claude_desktop_config.json",
    where: "Paste into Settings › Developer › Edit Config, then restart Claude. Needs Node.js.",
    snippet: (url) =>
      jsonSnippet({
        mcpServers: { [SERVER_NAME]: { command: "npx", args: ["-y", "mcp-remote", url] } },
      }),
  },
  {
    id: "codex",
    label: "Codex CLI",
    snippetLabel: "config.toml",
    where: "Paste into ~/.codex/config.toml.",
    snippet: (url) => `[mcp_servers.${SERVER_NAME}]\nurl = "${url}"`,
  },
  {
    id: "gemini",
    label: "Gemini CLI",
    snippetLabel: "Terminal command",
    where: "Run it in a terminal.",
    snippet: (url) => `gemini mcp add --transport http ${SERVER_NAME} ${url}`,
  },
  {
    id: "antigravity",
    label: "Antigravity",
    snippetLabel: "mcp_config.json",
    where:
      "Paste into the agent panel's ⋯ › MCP Servers › Manage MCP Servers › View raw config (~/.gemini/antigravity/mcp_config.json).",
    snippet: (url) => jsonSnippet({ mcpServers: { [SERVER_NAME]: { serverUrl: url } } }),
  },
  {
    id: "cursor",
    label: "Cursor",
    snippetLabel: "mcp.json",
    where: "Paste into ~/.cursor/mcp.json, or .cursor/mcp.json in a project.",
    snippet: (url) => jsonSnippet({ mcpServers: { [SERVER_NAME]: { url } } }),
    installLink: (url) =>
      `cursor://anysphere.cursor-deeplink/mcp/install?name=${SERVER_NAME}&config=${encodeURIComponent(btoa(JSON.stringify({ url })))}`,
  },
  {
    id: "vscode",
    label: "VS Code",
    snippetLabel: "mcp.json",
    where: "Paste into .vscode/mcp.json in a project, for Copilot's agent mode.",
    snippet: (url) => jsonSnippet({ servers: { [SERVER_NAME]: { type: "http", url } } }),
    installLink: (url) =>
      `vscode:mcp/install?${encodeURIComponent(JSON.stringify({ name: SERVER_NAME, type: "http", url }))}`,
  },
  {
    id: "windsurf",
    label: "Windsurf",
    snippetLabel: "mcp_config.json",
    where: "Paste into ~/.codeium/windsurf/mcp_config.json.",
    snippet: (url) => jsonSnippet({ mcpServers: { [SERVER_NAME]: { serverUrl: url } } }),
  },
  {
    id: "zed",
    label: "Zed",
    snippetLabel: "settings.json",
    where: "Merge into Zed's settings.json.",
    snippet: (url) => jsonSnippet({ context_servers: { [SERVER_NAME]: { url } } }),
  },
  {
    id: "opencode",
    label: "opencode",
    snippetLabel: "opencode.json",
    where: "Merge into opencode.json (in a project or ~/.config/opencode/).",
    snippet: (url) => jsonSnippet({ mcp: { [SERVER_NAME]: { type: "remote", url } } }),
  },
  {
    id: "other",
    label: "Other (JSON)",
    snippetLabel: "JSON config",
    where: "The usual mcpServers entry: .mcp.json, Cline and most other agents.",
    snippet: (url) => jsonSnippet({ mcpServers: { [SERVER_NAME]: { type: "http", url } } }),
  },
];
