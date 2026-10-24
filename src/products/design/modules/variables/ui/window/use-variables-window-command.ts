import { useEffect } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { useVariablesWindowStore } from "./variables-window-store";

/** Runs the `openVariables` command: opens the Variables window (or closes it when it's open). */
export function useVariablesWindowCommand(): void {
  const engine = useDesignEngine();
  useEffect(
    () =>
      engine.handleHostAction("openVariables", () => {
        const { open, setOpen } = useVariablesWindowStore.getState();
        setOpen(!open);
      }),
    [engine],
  );
}
