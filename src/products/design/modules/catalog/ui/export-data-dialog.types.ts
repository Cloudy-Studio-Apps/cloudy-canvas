import type { ExportDataAnswer, ExportDataSource } from "./stores/export-data-store.types";

export interface ExportDataDialogProps {
  /** The sources the brochure reads; `null` keeps the dialog closed. */
  sources: readonly ExportDataSource[] | null;
  /** The choice, or `null` when the user cancels (Esc, or closing it). */
  onAnswer: (answer: ExportDataAnswer | null) => void;
}
