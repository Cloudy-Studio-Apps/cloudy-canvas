import { useMemo, useSyncExternalStore } from "react";

import { useService } from "@canvas-ui";
import { bookLayout, DESIGN_BROCHURE } from "@design";
import type { BrochureView } from "./use-brochure.types";

/** The design's brochure, read again when the document changes. */
export function useBrochure(): BrochureView {
  const brochure = useService(DESIGN_BROCHURE);
  const version = useSyncExternalStore(brochure.subscribe, brochure.getVersion);
  return useMemo(() => {
    // One read of the pages, which the layout's sides then share.
    const pages = brochure.pages();
    const settings = brochure.settings();
    const layout = bookLayout(pages, settings);
    return {
      brochure,
      version,
      pages,
      settings,
      layout,
      label: (page) => layout.labels.get(page.slot.id) ?? String(page.number),
    };
  }, [brochure, version]);
}
