import type { CanvasWorkspace } from "../../workspace";
import type { ModelBaker, ModelData, ModelImport } from "../model3d.types";
import type { Rect } from "../../geometry.types";

/** What the shared model tool code needs of an agent's workspace. */
export type ModelAgentWorkspace = Pick<CanvasWorkspace, "doc" | "service" | "getElement" | "kinds">;

/** What a model tool says in its messages: "board" or "design". */
export type ModelFileNoun = "board" | "design";

/** Reads a file from an absolute path (the agent host's `readFile`). */
export type ReadAgentFile = (path: string) => Promise<Uint8Array>;

/** A model file read for `add_model`/`add_model_node`, validated and not stored yet. */
export interface AgentModelImport {
  imp: ModelImport;
  /** Where and how big it is placed. */
  rect: Rect;
}

/** What `add_model`/`add_model_node` report of a stored model. */
export interface AgentModelReport {
  slots: string[];
  /** Texture slots whose file was not found (shown gray). */
  missing: string[];
  /** Set over 10 MB. */
  warning?: string;
}

export interface SetModelViewOptions {
  engine: ModelAgentWorkspace;
  /** The model element, as read from the workspace. */
  el: ModelData & { id: string };
  args: Record<string, unknown>;
  baker: ModelBaker;
  readFile: ReadAgentFile;
  noun: ModelFileNoun;
}
