import { useEffect, useRef } from "react";

import { DEFAULT_MODE } from "@canvas";
import { pagesOf } from "../../../pages";
import { STYLEGUIDE_MODE_ID } from "../../mode/styleguide-mode.constants";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { useSystemPage } from "./use-system-page";

/**
 * Shows the system page while the Design system mode is on, and the page the user was on when it
 * goes off. The system page shown outside the mode (following someone there) turns the mode on;
 * another page shown while it's on (following someone out) turns it off. Only the view changes:
 * the document is never written.
 */
export function useStyleguideScope(): void {
  const engine = useDesignEngine();
  const inMode = useDesignState((state) => state.mode === STYLEGUIDE_MODE_ID);
  const scope = useDesignState((state) => state.scope);
  const systemId = useSystemPage()?.id ?? null;
  /** The page to go back to, remembered when the mode comes on. */
  const previous = useRef<string | null>(null);
  const wasInMode = useRef(inMode);
  const hadSystem = useRef(systemId);

  useEffect(() => {
    const entered = inMode && !wasInMode.current;
    const left = !inMode && wasInMode.current;
    const appeared = systemId !== null && hadSystem.current === null;
    wasInMode.current = inMode;
    hadSystem.current = systemId;
    if (inMode) {
      if (entered) previous.current = scope === systemId ? null : scope;
      if (!systemId || scope === systemId) return;
      // Entering, or the page just made (the first token): show it. Otherwise something else
      // showed another page (following someone out): leave the mode there.
      if (entered || appeared) engine.setScope(systemId);
      else engine.setMode(DEFAULT_MODE.id);
      return;
    }
    if (scope === null || scope !== systemId) return;
    if (left) {
      const back = previous.current ?? pagesOf(engine.doc)[0]?.id ?? null;
      if (back) engine.setScope(back);
    } else {
      engine.setMode(STYLEGUIDE_MODE_ID);
    }
  }, [engine, inMode, scope, systemId]);
}
