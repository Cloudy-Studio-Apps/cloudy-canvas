import { useMemo, useSyncExternalStore } from "react";

import { useService } from "@canvas-ui";
import { DESIGN_BROCHURE } from "@design";
import type { BrochureView } from "./use-brochure.types";

/** The design's brochure, read again when the document changes. */
export function useBrochure(): BrochureView {
  const brochure = useService(DESIGN_BROCHURE);
  const version = useSyncExternalStore(brochure.subscribe, brochure.getVersion);
  return useMemo(
    () => ({ brochure, version, pages: brochure.pages(), settings: brochure.settings() }),
    [brochure, version],
  );
}
