import type { LoadingManager } from "three";

export interface ModelManager {
  manager: LoadingManager;
  /** Resolves once every file the loaders started has finished (or failed). */
  settled(): Promise<void>;
  /** Releases the blob URLs made for the files. */
  dispose(): void;
}
