import { useEffect } from "react";

import { whenIdle } from "@canvas";
import { CATALOG_MODE_ID } from "@design";
import { useDesignState } from "@design/ui/design-engine-context";
import { useBrochure } from "./use-brochure";

/** How long the mode shows as it was before its frames glide into place. */
const SETTLE_MS = 150;

/**
 * Lays the open brochure's frames out again on entering the Catalog mode, or on showing another
 * page or brochure in it, while its `arrange` setting is on: frames may have been moved or resized
 * in the Design mode meanwhile. It waits until the mode is on screen (and the app idle), so the
 * switch shows at once and the frames then glide into place.
 */
export function useArrangeOnEnter(): void {
  const inMode = useDesignState((state) => state.mode === CATALOG_MODE_ID);
  const { brochure, settings } = useBrochure();
  const on = settings.arrange !== "off";
  useEffect(() => {
    if (!inMode || !on || !brochure) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      void whenIdle().then(() => {
        if (!cancelled) brochure.keepArranged();
      });
    }, SETTLE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inMode, on, brochure]);
}
