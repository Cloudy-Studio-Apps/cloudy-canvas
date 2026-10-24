import { useSyncExternalStore } from "react";

import type { SnapshotSource } from "./use-store-state.types";

/** A canvas `Store`'s snapshot, re-read when it changes (a live session's state). */
export function useStoreState<T>(store: SnapshotSource<T>): T {
  return useSyncExternalStore(store.subscribe, store.get);
}
