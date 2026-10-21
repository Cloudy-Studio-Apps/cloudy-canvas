import type { AgentTool } from "@canvas";
import type { FileInfo } from "@shared/core";

import type { BoardEngine } from "../board-engine.types";
import type { DbSchema, ErModel } from "../elements";

/** The board open in the window. */
export interface AgentBoard {
  id: string;
  name: string;
  /** `null` until the board is saved for the first time. */
  path: string | null;
  dirty: boolean;
  engine: BoardEngine;
  /** The board's database schema, edited as DBML. */
  schema: DbSchema;
  /** The board's ER diagrams, edited as text. */
  er: ErModel;
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
