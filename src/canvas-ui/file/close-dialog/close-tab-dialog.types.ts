import type { SaveChangesChoice } from "./save-changes-dialog.types";

export interface CloseTabDialogProps {
  open: boolean;
  /** The file's name. */
  name: string;
  /** Saving before closing. */
  busy: boolean;
  onChoose: (choice: SaveChangesChoice) => void;
}
