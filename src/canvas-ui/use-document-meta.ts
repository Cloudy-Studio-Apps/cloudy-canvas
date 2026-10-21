import { useCallback, useMemo, useSyncExternalStore } from "react";

import type { CanvasDocument, DocumentMeta } from "@canvas";

/** The document's title and description, re-read when they change (edits, undo, agents). */
export function useDocumentMeta(doc: CanvasDocument): DocumentMeta {
  const subscribe = useCallback((listener: () => void) => doc.observeMeta(listener), [doc]);
  // Read as strings, so each snapshot compares by value.
  const title = useSyncExternalStore(subscribe, () => doc.meta().title);
  const description = useSyncExternalStore(subscribe, () => doc.meta().description);
  return useMemo(() => ({ title, description }), [title, description]);
}
