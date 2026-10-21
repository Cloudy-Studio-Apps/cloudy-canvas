import { useSyncExternalStore } from "react";

import { useEngine } from "./engine-context";

/** Changes whenever any ER shape on the board changes. */
export function useErVersion(): number {
  const { er } = useEngine();
  return useSyncExternalStore(er.subscribe, er.getVersion);
}
