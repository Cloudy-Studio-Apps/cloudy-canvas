import { useMemo } from "react";

import { useDocumentTokens } from "@canvas-ui";
import { contrastChecks, type ContrastCheck } from "../../contrast";

/** Every contrast check of the file (declared and automatic pairs), failing first. */
export function useContrastChecks(): ContrastCheck[] {
  const { store } = useDocumentTokens();
  return useMemo(() => contrastChecks(store), [store]);
}
