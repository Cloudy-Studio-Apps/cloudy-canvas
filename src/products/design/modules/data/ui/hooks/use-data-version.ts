import { useEffect, useReducer } from "react";

import type { DesignDataSources } from "../../model";

/** Re-renders whenever a source changes or an Update moves on; the number counts the changes. */
export function useDataVersion(sources: DesignDataSources): number {
  const [version, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => sources.onChange(bump), [sources]);
  return version;
}
