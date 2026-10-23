import { useEffect, useState, type RefObject } from "react";

import type { VirtualRange } from "./use-virtual-list.types";

/**
 * The rows of a long list of fixed-height rows that are in view in `scroll` (plus `overscan`
 * above and below), so only those are drawn. Follows scrolling and resizing.
 */
export function useVirtualList(
  scroll: RefObject<HTMLElement | null>,
  count: number,
  rowHeight: number,
  overscan = 8,
): VirtualRange {
  const [view, setView] = useState({ top: 0, height: 0 });

  useEffect(() => {
    const element = scroll.current;
    if (!element) return;
    const read = () => setView({ top: element.scrollTop, height: element.clientHeight });
    read();
    element.addEventListener("scroll", read, { passive: true });
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", read);
      observer.disconnect();
    };
  }, [scroll]);

  const first = Math.floor(view.top / rowHeight);
  const shown = Math.ceil(view.height / rowHeight) + 1;
  return {
    start: Math.max(0, first - overscan),
    end: Math.min(count, first + shown + overscan),
    totalHeight: count * rowHeight,
  };
}
