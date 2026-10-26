import { useMemo } from "react";

import { isPageFrame } from "../../model/page-frame";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { useBrochure } from "./use-brochure";
import type { CatalogSelection } from "./use-catalog-selection.types";

/** What the selection is to the brochure: a page, a frame not in it, several frames or nothing. */
export function useCatalogSelection(): CatalogSelection {
  const engine = useDesignEngine();
  const ids = useDesignState((state) => state.selectedIds);
  const { pages } = useBrochure();
  return useMemo(() => {
    const frames = ids.map((id) => engine.doc.get(id)).filter(isPageFrame);
    const [frame, ...others] = frames;
    if (!frame) return { kind: "none" };
    if (others.length > 0) return { kind: "several", frames };
    const page = pages.find((item) => item.options.some((option) => option.id === frame.id));
    return page ? { kind: "page", page, frame } : { kind: "loose", frame };
  }, [engine, ids, pages]);
}
