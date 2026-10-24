export interface BrochureExportOptions {
  /** Called after each page is drawn, with how many are done of how many. */
  onProgress?: (done: number, total: number) => void;
}
