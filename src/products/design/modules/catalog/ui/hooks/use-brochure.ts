import { useMemo, useSyncExternalStore } from "react";

import { useService } from "@canvas-ui";
import { BROCHURE_DEFAULTS } from "../../brochure/brochure.defaults";
import { bookLayout } from "../../model/book-layout";
import { DESIGN_BROCHURES } from "../../model/design-brochures";
import { pageNumbers, printedLabels } from "../../model/numbering";
import { useDesignState } from "@design/ui/design-engine-context";
import type { BrochureView } from "./use-brochure.types";

/** The open brochure of the design page on screen, read again when the document changes. */
export function useBrochure(): BrochureView {
  const brochures = useService(DESIGN_BROCHURES);
  const version = useSyncExternalStore(brochures.subscribe, brochures.getVersion);
  const scope = useDesignState((state) => state.scope);
  return useMemo(() => {
    const brochure = brochures.current(scope);
    // One read of the pages, which the layout's sides then share.
    const pages = brochure?.pages() ?? [];
    const settings = brochure?.settings() ?? { ...BROCHURE_DEFAULTS.settings };
    const layout = bookLayout(pages, settings);
    const record = brochure?.record();
    const numbers = record ? pageNumbers(layout, record) : [];
    const printed = printedLabels(layout, numbers);
    return {
      brochures,
      list: scope === null ? [] : brochures.list(scope),
      brochure,
      scope,
      version,
      pages,
      settings,
      layout,
      masters: record?.masters ?? [],
      sections: record?.sections ?? [],
      numbers,
      label: (page) =>
        printed.get(page.slot.id) ?? layout.labels.get(page.slot.id) ?? String(page.number),
    };
  }, [brochures, scope, version]);
}
