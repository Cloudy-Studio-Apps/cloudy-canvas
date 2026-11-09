/** Which file this app shares now, without the session itself (`sharingState`). */
export interface SharingState {
  /** The shared file's id, `null` while nothing is shared. */
  fileId(): string | null;
  set(fileId: string | null): void;
  /** Calls `listener` whenever the shared file changes; returns how to stop. */
  subscribe(listener: () => void): () => void;
}
