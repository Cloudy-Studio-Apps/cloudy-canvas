export interface ConvertStore {
  /** The model to convert once confirmed, or `null` when the dialog is closed. */
  id: string | null;
  ask(id: string): void;
  close(): void;
}
