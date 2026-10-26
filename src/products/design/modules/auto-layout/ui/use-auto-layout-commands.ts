import { useEffect } from "react";

import { addAutoLayout, removeAutoLayout } from "../add-auto-layout";
import { useDesignEngine } from "@design/ui/design-engine-context";

/** Runs Add auto layout (Shift+A) and Remove auto layout (Alt+Shift+A) on the selection. */
export function useAutoLayoutCommands(): void {
  const engine = useDesignEngine();
  useEffect(() => {
    const removeAdd = engine.handleHostAction("addAutoLayout", () => {
      const ids = new Set(engine.selectedIds());
      const frames = addAutoLayout(engine.doc, ids, engine.elements(), engine.kinds);
      if (frames.length > 0) engine.select(frames);
    });
    const removeRemove = engine.handleHostAction("removeAutoLayout", () => {
      removeAutoLayout(engine.doc, new Set(engine.selectedIds()), engine.elements());
    });
    return () => {
      removeAdd();
      removeRemove();
    };
  }, [engine]);
}
