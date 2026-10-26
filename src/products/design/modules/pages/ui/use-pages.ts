import { useState, useSyncExternalStore } from "react";

import { useService } from "@canvas-ui";
import { DESIGN_PAGES } from "../design-pages";
import type { PageElement } from "../page/page.types";

/** The design's pages, in order, read again only when the document changes. */
export function usePages(): readonly PageElement[] {
  const pages = useService(DESIGN_PAGES);
  const version = useSyncExternalStore(pages.subscribe, pages.getVersion);
  const [cache, setCache] = useState(() => ({ version, list: pages.pages() }));
  if (cache.version !== version) {
    const list = pages.pages();
    // The same array while the pages stay the same, so rows don't redraw on every edit.
    const same =
      list.length === cache.list.length &&
      list.every((page, i) => {
        const before = cache.list[i];
        return before?.id === page.id && before.name === page.name;
      });
    const next = { version, list: same ? cache.list : list };
    setCache(next);
    return next.list;
  }
  return cache.list;
}
