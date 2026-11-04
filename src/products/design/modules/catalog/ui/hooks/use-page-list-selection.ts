import { useCallback, useMemo, useRef } from "react";

import { selectedSlots } from "../../model/selected-slots";
import type { BrochurePage } from "../../model/brochure-pages.types";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { showPage } from "../page-actions";
import type { PageClick, PageListSelection } from "./use-page-list-selection.types";

/**
 * Selecting pages in the Brochure tab. The selection is the canvas's (the pages' frames), so the
 * list, the canvas and Delete agree: a click shows a page, Ctrl/⌘ + click adds or takes one out,
 * Shift + click selects the pages from the last one clicked to this one.
 */
export function usePageListSelection(pages: readonly BrochurePage[]): PageListSelection {
  const engine = useDesignEngine();
  const ids = useDesignState((state) => state.selectedIds);
  const anchor = useRef<string | null>(null);
  const selected = useMemo(() => new Set(selectedSlots(pages, ids)), [pages, ids]);

  const click = useCallback(
    (page: BrochurePage, event: PageClick) => {
      const order = pages.map((item) => item.slot.id);
      const from = anchor.current === null ? -1 : order.indexOf(anchor.current);
      if (event.shiftKey && from >= 0) {
        const to = order.indexOf(page.slot.id);
        const [start, end] = from < to ? [from, to] : [to, from];
        engine.select(pages.slice(start, end + 1).map((item) => item.frame.id));
        return;
      }
      anchor.current = page.slot.id;
      if (event.ctrlKey || event.metaKey) {
        const options = new Set(page.options.map((option) => option.id));
        const current = engine.selectedIds();
        engine.select(
          selected.has(page.slot.id)
            ? current.filter((id) => !options.has(id))
            : [...current, page.frame.id],
        );
        return;
      }
      showPage(engine, page.frame);
    },
    [engine, pages, selected],
  );

  const draggedFor = useCallback(
    (slotId: string) =>
      selected.has(slotId)
        ? pages.map((page) => page.slot.id).filter((id) => selected.has(id))
        : [slotId],
    [pages, selected],
  );

  return { selected, click, draggedFor };
}
