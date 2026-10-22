import type { AgentTool, ElementKinds } from "@canvas";
import type { FileInfo } from "@shared/core";

import type { BoardEngine } from "../board-engine.types";
import type { BoardToolOptions } from "../board-options.types";

/** The board open in the window. */
export interface AgentBoard {
  id: string;
  name: string;
  /** `null` until the board is saved for the first time. */
  path: string | null;
  dirty: boolean;
  /** Its services (`DB_SCHEMA`, `ER_MODEL`, …) are `engine.service(…)`. */
  engine: BoardEngine;
  save(): Promise<void>;
}

/** What board tools can reach beyond the engine, implemented by the app. */
export interface AgentRecentFile extends FileInfo {
  /** Moved or deleted since it was last seen. */
  missing: boolean;
}

export interface AgentHost {
  board(): AgentBoard | null;
  recentFiles(): Promise<AgentRecentFile[]>;
  /** Opens a board in the window and resolves once it's ready. */
  openBoard(id: string): Promise<AgentBoard>;
  newBoard(): Promise<AgentBoard>;
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
export interface BoardAgentToolGroup {
  id: string;
  tools(context: BoardAgentContext): BoardAgentTool[];
}
