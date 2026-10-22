import type { AgentFile, AgentRecentFile, AgentTool, AgentToolGroup, ElementKinds } from "@canvas";

import type { BoardEngine } from "../board-engine.types";
import type { BoardToolOptions } from "../board-options.types";

export type { AgentRecentFile } from "@canvas";

/** The board open in the window. Its services (`DB_SCHEMA`, `ER_MODEL`, …) are `engine.service(…)`. */
export type AgentBoard = AgentFile<BoardEngine>;

/** What board tools can reach beyond the engine, implemented by the app. */
export interface AgentHost {
  board(): AgentBoard | null;
  recentFiles(): Promise<AgentRecentFile[]>;
  /** Opens a board in the window and resolves once it's ready. */
  openBoard(id: string): Promise<AgentBoard>;
  newBoard(): Promise<AgentBoard>;
  /** The installed plugins and what happened to them when the app started. */
  plugins(): AgentPlugin[];
  /** Writes a file to an absolute path (exports), replacing what's there. */
  writeFile(path: string, file: Blob): Promise<void>;
}

/** A tool that acts on the open board. */
export type BoardAgentTool = AgentTool<AgentHost>;

/** What a group of agent tools is made with: the board's composed element kinds. */
export interface BoardAgentContext {
  kinds: ElementKinds<BoardToolOptions>;
}

/**
 * Agent tools a module adds (see `boardAgentTools`), made when the agent server starts. Most
 * groups ignore the context.
 */
export type BoardAgentToolGroup = AgentToolGroup<AgentHost, BoardAgentContext>;

/** An installed plugin, as agents see it. */
export interface AgentPlugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  state: "enabled" | "disabled" | "failed";
  error?: string;
  /** The agent tools it adds (when enabled). */
  tools: string[];
}
