/** Something that holds a snapshot and says when it changes (a canvas `Store`). */
export interface SnapshotSource<T> {
  get(): T;
  subscribe(listener: () => void): () => void;
}
