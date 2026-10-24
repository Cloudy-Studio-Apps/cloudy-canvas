import type { CanvasDocument } from "./canvas-document";
import type { ActorDocumentOptions } from "./actor-document.types";

/** Methods that write: they run as the actor (its origin and placement). */
const ACTOR_WRITES = new Set<PropertyKey>([
  "add",
  "addUntracked",
  "addAllUntracked",
  "update",
  "updateUntracked",
  "updateMany",
  "remove",
  "batch",
  "addAsset",
  "setMeta",
]);

/** History methods: they step through the actor's own history, not the user's. */
const ACTOR_HISTORY: Record<PropertyKey, (options: ActorDocumentOptions) => unknown> = {
  history: ({ history }) => history,
  checkpoint:
    ({ history }) =>
    () =>
      history.checkpoint(),
  undo:
    ({ history }) =>
    () =>
      history.undo(),
  redo:
    ({ history }) =>
    () =>
      history.redo(),
  canUndo:
    ({ history }) =>
    () =>
      history.canUndo(),
  canRedo:
    ({ history }) =>
    () =>
      history.canRedo(),
  onHistoryChange: ({ history }) => history.onChange.bind(history),
};

/**
 * The document as one collaborator edits it (an agent): the same content, but its writes are
 * made as `actor` (`CanvasDocument.runAs`) and its undo methods are its own history's. It is a
 * `CanvasDocument`, so tools, services and `asUndoStep` work on it unchanged.
 */
export function actorDocument(doc: CanvasDocument, options: ActorDocumentOptions): CanvasDocument {
  return new Proxy(doc, {
    get(target, key) {
      const history = ACTOR_HISTORY[key];
      if (history) return history(options);
      const value: unknown = Reflect.get(target, key, target);
      if (typeof value !== "function") return value;
      if (!ACTOR_WRITES.has(key)) return value.bind(target);
      return (...args: unknown[]) =>
        target.runAs(options.actor(), () =>
          (value as (...a: unknown[]) => unknown).apply(target, args),
        );
    },
  });
}
