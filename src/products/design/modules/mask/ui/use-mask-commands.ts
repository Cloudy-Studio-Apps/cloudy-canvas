import { useEffect } from "react";

import { asUndoStep } from "@canvas";
import { maskedByMask, maskNodes, masksAmong, maskOverNode, releaseMasks } from "../mask-edits";
import { useDesignEngine } from "@design/ui/design-engine-context";

/**
 * Runs the mask commands on the selection: Use as mask (Ctrl+Alt+M, which releases masks when
 * every selected layer is one), Release mask, Select mask and Select masked layers.
 */
export function useMaskCommands(): void {
  const engine = useDesignEngine();
  useEffect(() => {
    const selected = () => new Set(engine.selectedIds());
    const removers = [
      engine.handleHostAction("useAsMask", () => {
        const ids = asUndoStep(engine.doc, () =>
          maskNodes(engine.doc, selected(), engine.elements(), engine.kinds),
        );
        if (ids.length > 0) engine.select(ids);
      }),
      engine.handleHostAction("releaseMask", () => {
        const released = asUndoStep(engine.doc, () =>
          releaseMasks(engine.doc, selected(), engine.elements()),
        );
        if (released.length > 0) engine.select(released);
      }),
      engine.handleHostAction("selectMask", () => {
        const elements = engine.elements();
        const masks = [...selected()].map((id) => maskOverNode(id, elements));
        const ids = [...new Set(masks.filter((id) => id !== null))];
        if (ids.length > 0) engine.select(ids);
      }),
      engine.handleHostAction("selectMasked", () => {
        const elements = engine.elements();
        const masks = masksAmong(selected(), elements);
        const ids = masks.flatMap((mask) => maskedByMask(mask.id, elements));
        if (ids.length > 0) engine.select(ids);
      }),
    ];
    return () => {
      for (const remove of removers) remove();
    };
  }, [engine]);
}
