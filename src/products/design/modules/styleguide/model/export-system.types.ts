/** What `exportSystem` reports while it draws. */
export interface SystemExportOptions {
  onProgress?: (done: number, total: number) => void;
}
