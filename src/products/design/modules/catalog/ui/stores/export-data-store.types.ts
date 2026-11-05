/** How a brochure export reads its data: updating its sources first, or as the file holds it. */
export type ExportDataAnswer = "update" | "saved";

/** A source the export asks about, as the dialog lists it. */
export interface ExportDataSource {
  id: string;
  name: string;
  /** When its data was last updated, `null` when it never was. */
  updatedAt: number | null;
}

/** The question an export is waiting on, if any. */
export interface ExportDataQuestion {
  sources: ExportDataSource[];
  /** Gets the answer, `null` when the user cancels. */
  resolve: (answer: ExportDataAnswer | null) => void;
}

export interface ExportDataState {
  question: ExportDataQuestion | null;
  /** Asks; resolves with the answer, `null` on cancel (a question already open is cancelled). */
  ask: (sources: ExportDataSource[]) => Promise<ExportDataAnswer | null>;
  answer: (answer: ExportDataAnswer | null) => void;
}
