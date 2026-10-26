import { useCallback } from "react";

import { generatedMark, sectionKey, STYLEGUIDE_MODE_ID } from "@design";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { useStyleguideViewStore } from "../stores/styleguide-view-store";

/** How much room a shown section gets round it. */
const PADDING = 80;

/**
 * Shows a category's sheet (selected, zoomed to) or one of its groups (the view framed on its
 * section), and makes it what the sidebar shows.
 */
export function useShowSection(): (
  category: string,
  sheetId: string | undefined,
  group?: string,
) => void {
  const engine = useDesignEngine();
  const select = useStyleguideViewStore((state) => state.select);
  return useCallback(
    (category, sheetId, group) => {
      select(group ? { category, group } : { category });
      if (!sheetId || engine.modeId !== STYLEGUIDE_MODE_ID) return;
      engine.select([sheetId]);
      if (!group) {
        engine.zoomToSelection();
        return;
      }
      const key = sectionKey(group);
      const section = engine.elements().find((el) => {
        const mark = generatedMark(el);
        return mark?.sheet === sheetId && mark.key === key;
      });
      if (!section) return;
      engine.showViewport({
        x: section.x - PADDING,
        y: section.y - PADDING,
        w: section.w + PADDING * 2,
        h: section.h + PADDING * 2,
      });
    },
    [engine, select],
  );
}
