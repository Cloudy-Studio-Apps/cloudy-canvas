import { useSyncExternalStore } from "react";

import { useErModel } from "./er-model-context";

/** Changes whenever any ER element on the board changes. */
export function useErVersion(): number {
  const er = useErModel();
  return useSyncExternalStore(er.subscribe, er.getVersion);
}
