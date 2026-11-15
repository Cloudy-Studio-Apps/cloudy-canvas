import { useEffect, useState, type RefObject } from "react";

/**
 * Whether the element has come into view (in its scroll area, or a `margin` around it) at least
 * once: it stays `true` after, so what it started isn't stopped by scrolling past.
 */
export function useInView(ref: RefObject<Element | null>, margin = "200px"): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (seen || !el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setSeen(true);
      },
      { rootMargin: margin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin, seen]);
  return seen;
}
