export interface BrochureExportOptions {
  /**
   * The data its pages read: `"update"` updates the sources it reads first (a failure stops the
   * export); `"saved"`, the default, uses what the file holds.
   */
  data?: "update" | "saved";
  /** Called after each page is drawn, with how many are done of how many. */
  onProgress?: (done: number, total: number) => void;
  /** Called as the export updates a source or starts making the pages repeats leave pending. */
  onStep?: (step: BrochureExportStep) => void;
}

/** What a brochure export is doing before it draws the pages. */
export type BrochureExportStep = { step: "updating"; source: string } | { step: "making" };

/** A brochure's PDF and how many pages it has. */
export interface BrochureExport {
  file: Blob;
  pages: number;
}
