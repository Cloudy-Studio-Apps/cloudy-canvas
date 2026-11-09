import { useEffect, useState } from "react";

import type { Size } from "@canvas";

/** An element's size in CSS pixels, kept up to date as it resizes; `null` until it's measured. */
export function useElementSize(el: HTMLElement | null): Size | null {
  const [size, setSize] = useState<Size | null>(null);
  useEffect(() => {
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize((now) => (now?.w === width && now.h === height ? now : { w: width, h: height }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);
  return size;
}
