import { useEffect } from "react";

import { frameNodes } from "../../frame";
import { groupNodes, ungroupNodes } from "../group-nodes";
import { useDesignEngine } from "@design/ui/design-engine-context";

/** Runs the group (Ctrl+G), frame selection (Ctrl+Alt+G) and ungroup (Ctrl+Shift+G) commands. */
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
    const removeFrame = engine.handleHostAction("frameSelection", () => {
      const id = frameNodes(
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
      removeFrame();
      removeUngroup();
    };
  }, [engine]);
}
