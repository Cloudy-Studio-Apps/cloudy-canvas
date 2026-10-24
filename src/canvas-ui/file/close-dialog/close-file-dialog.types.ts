/** The user's answer: quit (saving pending changes as usual), save first, or stay. */
export type CloseChoice = "close" | "save" | "cancel";

export interface CloseFileDialogProps {
  open: boolean;
  /** The file's name, for the description. */
  name: string;
  /** The changes can't be saved by quitting (autosave off or failing), so Save is offered. */
  unsaved: boolean;
  /** Saving before quitting. */
  busy: boolean;
  onChoose: (choice: CloseChoice) => void;
}

export interface CloseFileGuardProps {
  /** Takes the file's preview now (see `useCanvasThumbnail`); called when the dialog opens. */
  capture: () => Promise<void>;
}
