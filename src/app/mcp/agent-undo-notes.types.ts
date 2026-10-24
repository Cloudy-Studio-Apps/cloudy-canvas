/** What the user did to an agent's step from the app. */
export type UndoNoteKind = "undid" | "redid";

/** Notes owed to agents about their steps the user undid or redid, each sent once. */
export interface UndoNotes {
  record(id: string, kind: UndoNoteKind, label: string | null): void;
  /** The notes for collaborator `id`, then forgets them. */
  take(id: string): string[];
}
