/** A file dropped on the window, read on demand. */
export interface DroppedFile {
  /** Its name with the extension, e.g. "photo.png". */
  name: string;
  /** Where it is on disk, or `null` when the platform gives no path (a browser drop). */
  path: string | null;
  read(): Promise<Uint8Array>;
}

/** Files dropped on the window, and where: `at` is in client (CSS) pixels. */
export interface FileDrop {
  files: DroppedFile[];
  at: { x: number; y: number };
}
