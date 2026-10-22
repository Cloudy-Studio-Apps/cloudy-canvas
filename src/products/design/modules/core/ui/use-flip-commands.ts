import { useEffect } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { flipNodes } from "../transform";

/** Runs the flip commands (Shift+H, Shift+V) on the selection. */
export function useFlipCommands(): void {
  const engine = useDesignEngine();
  useEffect(() => {
    const removeHorizontal = engine.handleHostAction("flipHorizontal", () => {
      flipNodes(engine, engine.selectedIds(), "x");
    });
    const removeVertical = engine.handleHostAction("flipVertical", () => {
      flipNodes(engine, engine.selectedIds(), "y");
    });
    return () => {
      removeHorizontal();
      removeVertical();
    };
  }, [engine]);
}
