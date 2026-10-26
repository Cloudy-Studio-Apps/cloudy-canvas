import { useEffect } from "react";

import { placeholderPatches } from "../placeholder/placeholder-patches";
import { useDesignEngine } from "@design/ui/design-engine-context";

/**
 * Runs Use as image placeholder: every selected layer that takes fills shows a placeholder of its
 * own color instead, in one undo step, so the Catalog lists it as a picture to replace.
 */
export function useImagePlaceholderCommand(): void {
  const engine = useDesignEngine();
  useEffect(
    () =>
      engine.handleHostAction("imagePlaceholder", () => {
        const selected = engine.selectedIds().flatMap((id) => engine.getElement(id) ?? []);
        const patches = placeholderPatches(engine.doc, engine.kinds, selected);
        if (patches.size === 0) return;
        engine.doc.checkpoint();
        engine.doc.updateMany(patches);
      }),
    [engine],
  );
}
