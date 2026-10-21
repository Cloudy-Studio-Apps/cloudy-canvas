import type { FileInfo, JsonSchema } from "@core";
import type { CanvasEngine } from "../canvas-engine";

export type ToolArgs = Record<string, unknown>;

/** A tool agents can call over MCP. Protocol-agnostic: the host adapts it (see `core/mcp`). */
export interface AgentTool {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  /** Returns a string or a JSON value; throws with a message the agent can act on. */
  run(host: AgentHost, args: ToolArgs): unknown;
}

/** The board open in the window. */
export interface AgentBoard {
  id: string;
  name: string;
  /** `null` until the board is saved for the first time. */
  path: string | null;
  dirty: boolean;
  engine: CanvasEngine;
  save(): Promise<void>;
}

/** What tools can reach beyond the engine, implemented by the app. */
export interface AgentHost {
  board(): AgentBoard | null;
  recentFiles(): Promise<FileInfo[]>;
  /** Opens a board in the window and resolves once it's ready. */
  openBoard(id: string): Promise<AgentBoard>;
  newBoard(): Promise<AgentBoard>;
}
