import { useEffect } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { useDesignPanelStore } from "@design/ui/stores/design-panel-store";

/** Runs the commands that open or close the left panel and the properties panel. */
export function usePanelCommands(): void {
  const engine = useDesignEngine();

  useEffect(() => {
    const removers = [
      engine.handleHostAction("toggleLeftPanel", () => {
        const { leftOpen, setLeftOpen } = useDesignPanelStore.getState();
        setLeftOpen(!leftOpen);
      }),
      engine.handleHostAction("toggleRightPanel", () => {
        const { rightOpen, setRightOpen } = useDesignPanelStore.getState();
        setRightOpen(!rightOpen);
      }),
    ];
    return () => {
      for (const remove of removers) remove();
    };
  }, [engine]);
}
