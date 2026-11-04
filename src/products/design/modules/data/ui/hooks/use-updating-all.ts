import { useCallback, useSyncExternalStore } from "react";

import type { DesignDataSources } from "../../model";
import { isUpdatingAll, onUpdateAllChange } from "./run-update";

/** Whether Update all runs for these sources (wherever it was started). */
export function useUpdatingAll(sources: DesignDataSources): boolean {
  const subscribe = useCallback(
    (listener: () => void) => onUpdateAllChange(sources, listener),
    [sources],
  );
  return useSyncExternalStore(subscribe, () => isUpdatingAll(sources));
}
