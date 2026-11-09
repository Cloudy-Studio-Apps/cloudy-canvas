/** The user's answer: save first, go on without saving, or stay. */
export type SaveChangesChoice = "save" | "discard" | "cancel";

export interface SaveChangesDialogProps {
  open: boolean;
  title: string;
  description: string;
  /** The button that saves, then goes on ("Save", "Save all and quit"). */
  saveLabel: string;
  /** The button that goes on without saving ("Don't save", "Quit without saving"). */
  discardLabel: string;
  /** Saving: the buttons wait. */
  busy: boolean;
  onChoose: (choice: SaveChangesChoice) => void;
}
