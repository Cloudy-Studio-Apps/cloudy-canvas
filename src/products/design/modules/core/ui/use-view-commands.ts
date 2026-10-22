import { useEffect } from "react";

import { useDesignEngine } from "@design/ui/design-engine-context";
import { useDesignViewStore } from "@design/ui/stores/design-view-store";

/**
 * Shows the rulers and guides as the user last left them, and runs the commands that show or hide
 * them (Shift+R, Shift+;) and that remove every guide of the page.
 */
export function useViewCommands(): void {
  const engine = useDesignEngine();

  useEffect(() => {
    const { rulers, guides } = useDesignViewStore.getState();
    engine.setRulersShown(rulers);
    engine.setGuidesShown(guides);
    const removers = [
      engine.handleHostAction("toggleRulers", () => {
        const shown = !engine.getState().rulersShown;
        engine.setRulersShown(shown);
        useDesignViewStore.getState().setRulers(shown);
      }),
      engine.handleHostAction("toggleGuides", () => {
        const shown = !engine.getState().guidesShown;
        engine.setGuidesShown(shown);
        useDesignViewStore.getState().setGuides(shown);
      }),
      engine.handleHostAction("clearGuides", () => engine.removeGuides()),
    ];
    return () => {
      for (const remove of removers) remove();
    };
  }, [engine]);
}
