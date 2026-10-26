import { useEffect } from "react";

import { groupNodes, ungroupNodes } from "../group-nodes";
import { useDesignEngine } from "@design/ui/design-engine-context";

/** Runs the group (Ctrl+G) and ungroup (Ctrl+Shift+G) commands on the selection. */
export function useGroupCommands(): void {
  const engine = useDesignEngine();
  useEffect(() => {
    const removeGroup = engine.handleHostAction("group", () => {
      const id = groupNodes(
        engine.doc,
        new Set(engine.selectedIds()),
        engine.elements(),
        engine.kinds,
      );
      if (id) engine.select([id]);
    });
    const removeUngroup = engine.handleHostAction("ungroup", () => {
      const children = ungroupNodes(engine.doc, new Set(engine.selectedIds()), engine.elements());
      if (children.length > 0) engine.select(children);
    });
    return () => {
      removeGroup();
      removeUngroup();
    };
  }, [engine]);
}
