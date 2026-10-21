import type { CanvasDocument } from "../document";
import type { CanvasElement, ElementKinds } from "../elements";

/** What `agentPatches` needs from the engine. */
export interface AgentPatchHost {
  readonly doc: CanvasDocument;
  readonly kinds: ElementKinds;
  /** The element as the scene has it (derived geometry resolved). */
  getElement(id: string): CanvasElement | undefined;
  /** The ids plus what moves with them (a section's contents, an entity's attributes). */
  withMembers(ids: Iterable<string>, purpose: "move" | "delete"): Set<string>;
}

/** One `{ id, patch }` of an agent's update. */
export interface AgentUpdate {
  id: string;
  patch: Record<string, unknown>;
}
