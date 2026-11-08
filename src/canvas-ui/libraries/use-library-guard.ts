import { useEffect, useRef } from "react";

import { revertLibraryEdits, type CanvasDocument } from "@canvas";
import { toast } from "@shared/stores/toast-store";
import { t } from "./libraries.i18n";

/**
 * While `active` (the file's project can't be found), puts back every edit the user makes to a
 * library record, untracked, and says once per editor why. The user's undo step stays, empty.
 */
export function useLibraryGuard(doc: CanvasDocument, active: boolean): void {
  const told = useRef(false);
  useEffect(() => {
    if (!active) return;
    let ids = new Set<string>();
    let previous = new Map<string, unknown>();
    const revert = () => {
      const changed = ids;
      const before = previous;
      ids = new Set();
      previous = new Map();
      if (!revertLibraryEdits(doc, changed, before) || told.current) return;
      told.current = true;
      toast({ title: t("readOnly.title"), description: t("readOnly.description") });
    };
    return doc.observeTokens((changed, source) => {
      if (!source.local) return;
      if (ids.size === 0) queueMicrotask(revert);
      for (const id of changed) {
        ids.add(id);
        // The value the file had before the first edit since the last revert.
        if (!previous.has(id)) previous.set(id, source.previous.get(id));
      }
    });
  }, [doc, active]);
}
