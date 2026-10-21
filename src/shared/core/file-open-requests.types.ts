/**
 * Files the user asks to open from outside the app: dropped on the window, picked with
 * "Open with", or given on the command line. Implemented per platform in `platform/`.
 */
export interface FileOpenRequests {
  /** Paths the app was launched with. Returned once; later calls give `[]`. */
  launchPaths(): Promise<string[]>;
  /** Paths dropped on the window or forwarded by a later launch. Returns an unsubscribe function. */
  onOpen(handler: (paths: string[]) => void): () => void;
  /** Whether files are being dragged over the window. Returns an unsubscribe function. */
  onDragOver(handler: (over: boolean) => void): () => void;
}
