import { Orbit, SquareTerminal } from "lucide-react";
import {
  siClaude,
  siClaudecode,
  siCursor,
  siGithubcopilot,
  siGooglegemini,
  siModelcontextprotocol,
  siOpencode,
  siWindsurf,
  siZedindustries,
} from "simple-icons";

import type { AgentClient } from "./agent-clients.types";

/** The name agents list the server under. */
const SERVER_NAME = "cloudy-canvas";

function jsonSnippet(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

/** The agent apps the connect dialog gives setups for, the most used first. */
export const AGENT_CLIENTS: readonly AgentClient[] = [
  {
    id: "claude-code",
    label: "Claude Code",
    icon: siClaudecode,
    snippetLabel: "Terminal command",
    where: "Run it in a terminal.",
    snippet: (url) => `claude mcp add --transport http ${SERVER_NAME} ${url}`,
  },
  {
    id: "codex",
    label: "Codex",
    icon: SquareTerminal,
    snippetLabel: "config.toml",
    where: "Paste into ~/.codex/config.toml.",
    snippet: (url) => `[mcp_servers.${SERVER_NAME}]\nurl = "${url}"`,
  },
  {
    id: "cursor",
    label: "Cursor",
    icon: siCursor,
    snippetLabel: "mcp.json",
    where: "Paste into ~/.cursor/mcp.json, or .cursor/mcp.json in a project.",
    snippet: (url) => jsonSnippet({ mcpServers: { [SERVER_NAME]: { url } } }),
    installLink: (url) =>
      `cursor://anysphere.cursor-deeplink/mcp/install?name=${SERVER_NAME}&config=${encodeURIComponent(btoa(JSON.stringify({ url })))}`,
  },
  {
    id: "vscode",
    label: "VS Code",
    icon: siGithubcopilot,
    snippetLabel: "mcp.json",
    where: "Paste into .vscode/mcp.json in a project, for Copilot's agent mode.",
    snippet: (url) => jsonSnippet({ servers: { [SERVER_NAME]: { type: "http", url } } }),
    installLink: (url) =>
      `vscode:mcp/install?${encodeURIComponent(JSON.stringify({ name: SERVER_NAME, type: "http", url }))}`,
  },
  {
    id: "antigravity",
    label: "Antigravity",
    icon: Orbit,
    snippetLabel: "mcp_config.json",
    where:
      "Paste into the agent panel's ⋯ › MCP Servers › Manage MCP Servers › View raw config (~/.gemini/antigravity/mcp_config.json).",
    snippet: (url) => jsonSnippet({ mcpServers: { [SERVER_NAME]: { serverUrl: url } } }),
  },
  {
    id: "gemini",
    label: "Gemini CLI",
    icon: siGooglegemini,
    snippetLabel: "Terminal command",
    where: "Run it in a terminal.",
    snippet: (url) => `gemini mcp add --transport http ${SERVER_NAME} ${url}`,
  },
  {
    id: "claude-desktop",
    label: "Claude Desktop",
    icon: siClaude,
    snippetLabel: "claude_desktop_config.json",
    where: "Paste into Settings › Developer › Edit Config, then restart Claude. Needs Node.js.",
    snippet: (url) =>
      jsonSnippet({
        mcpServers: { [SERVER_NAME]: { command: "npx", args: ["-y", "mcp-remote", url] } },
      }),
  },
  {
    id: "windsurf",
    label: "Windsurf",
    icon: siWindsurf,
    snippetLabel: "mcp_config.json",
    where: "Paste into ~/.codeium/windsurf/mcp_config.json.",
    snippet: (url) => jsonSnippet({ mcpServers: { [SERVER_NAME]: { serverUrl: url } } }),
  },
  {
    id: "zed",
    label: "Zed",
    icon: siZedindustries,
    more: true,
    snippetLabel: "settings.json",
    where: "Merge into Zed's settings.json.",
    snippet: (url) => jsonSnippet({ context_servers: { [SERVER_NAME]: { url } } }),
  },
  {
    id: "opencode",
    label: "opencode",
    icon: siOpencode,
    more: true,
    snippetLabel: "opencode.json",
    where: "Merge into opencode.json (in a project or ~/.config/opencode/).",
    snippet: (url) => jsonSnippet({ mcp: { [SERVER_NAME]: { type: "remote", url } } }),
  },
];

/** The default setup: the usual `mcpServers` entry most other agents read. */
export const GENERIC_AGENT_CLIENT: AgentClient = {
  id: "other",
  label: "Other agents",
  icon: siModelcontextprotocol,
  snippetLabel: "JSON config",
  where: "The usual mcpServers entry: .mcp.json, Cline and most other agents.",
  snippet: (url) => jsonSnippet({ mcpServers: { [SERVER_NAME]: { type: "http", url } } }),
};
