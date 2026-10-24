import type { DocumentActor } from "./canvas-document.types";
import type { UndoHistory } from "./document-history.types";

/** Who an actor document writes as, and the history its undo methods step through. */
export interface ActorDocumentOptions {
  /** Read at each write, so the placement can follow the actor's scope. */
  actor(): DocumentActor;
  history: UndoHistory;
}
