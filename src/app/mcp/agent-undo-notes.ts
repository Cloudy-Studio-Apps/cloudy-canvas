import type { UndoNoteKind, UndoNotes } from "./agent-undo-notes.types";

/** Notes kept per agent at most; older ones are dropped. */
const MAX_NOTES = 10;

/**
 * Keeps, per agent, what the user undid or redid of its work in the app, so its next tool reply
 * tells it (it may otherwise build on elements that are gone).
 */
export function createUndoNotes(): UndoNotes {
  const notes = new Map<string, string[]>();
  return {
    record(id, kind, label) {
      const list = [...(notes.get(id) ?? []), noteText(kind, label)];
      notes.set(id, list.slice(-MAX_NOTES));
    },
    take(id) {
      const list = notes.get(id) ?? [];
      notes.delete(id);
      return list;
    },
  };
}

function noteText(kind: UndoNoteKind, label: string | null): string {
  const what = label ? `your change “${label}”` : "one of your changes";
  return `Note: the user ${kind} ${what} in the app. Re-read what you were working on before continuing.`;
}
