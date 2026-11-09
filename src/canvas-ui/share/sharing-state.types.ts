import type { Awareness } from "y-protocols/awareness";

/** The file this app shares now and its session's awareness. */
export interface SharedFile {
  fileId: string;
  awareness: Awareness;
}

/** Which file this app shares now, without the session itself (`sharingState`). */
export interface SharingState {
  /** The shared file's id, `null` while nothing is shared. */
  fileId(): string | null;
  /** The shared file and its session's awareness, `null` while nothing is shared. */
  current(): SharedFile | null;
  set(shared: SharedFile | null): void;
  /** Calls `listener` whenever the shared file changes; returns how to stop. */
  subscribe(listener: () => void): () => void;
}
