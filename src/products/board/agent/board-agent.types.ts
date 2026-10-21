import type { AgentTool } from "@canvas";
import type { FileInfo } from "@shared/core";

import type { BoardEngine } from "../board-engine.types";
import type { DbSchema } from "../elements";

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
  save(): Promise<void>;
}

/** What board tools can reach beyond the engine, implemented by the app. */
export interface AgentHost {
  board(): AgentBoard | null;
  recentFiles(): Promise<FileInfo[]>;
  /** Opens a board in the window and resolves once it's ready. */
  openBoard(id: string): Promise<AgentBoard>;
  newBoard(): Promise<AgentBoard>;
}

/** A tool that acts on the open board. */
export type BoardAgentTool = AgentTool<AgentHost>;
