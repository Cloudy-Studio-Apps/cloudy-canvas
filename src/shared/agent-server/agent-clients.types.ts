import type { LucideIcon } from "lucide-react";
import type { SimpleIcon } from "simple-icons";

/** An app's logo: a brand icon (drawn in its color) or a Lucide icon for apps without one. */
export type AgentClientIcon = SimpleIcon | LucideIcon;

/** An agent app (MCP client) and how to point it at the agent server. */
export interface AgentClient {
  id: string;
  /** The app's name, e.g. "Cursor". */
  label: string;
  icon: AgentClientIcon;
  /** Recognizes the app by the name it connects with (MCP `clientInfo`) or its User-Agent. */
  match?: RegExp;
  /** Listed under "Other AI tools" instead of the main grid. */
  more?: boolean;
  /** What the snippet is, e.g. "Terminal command" or "mcp.json". */
  snippetLabel: string;
  /** Where the snippet goes, shown under it and in the copied toast. */
  where: string;
  /** The setup for the server at `url`. */
  snippet(url: string): string;
  /** A link that installs the server in the app in one click, when the app has one. */
  installLink?(url: string): string;
}
