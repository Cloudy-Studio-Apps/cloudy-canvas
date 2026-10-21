import { useCallback, useEffect, useRef, useState } from "react";

import type { SourceRange } from "./source-editor.types";
import { lineSpan } from "./text-lines";
import type { LineHighlightState, TextareaMetrics } from "./use-line-highlight.types";

/**
 * Where to draw the highlight band over the textarea, and scrolling so it's in view whenever the
 * highlighted lines change. Pass `range` as null to hide it (e.g. while the text is being edited).
 */
export function useLineHighlight(text: string, range: SourceRange | null): LineHighlightState {
  const area = useRef<HTMLTextAreaElement | null>(null);
  const [metrics, setMetrics] = useState<TextareaMetrics | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const ref = useCallback((el: HTMLTextAreaElement | null) => {
    area.current = el;
    if (!el) return;
    const style = getComputedStyle(el);
    setMetrics({
      lineHeight: parseFloat(style.lineHeight),
      paddingTop: parseFloat(style.paddingTop),
    });
  }, []);

  const span = range ? lineSpan(text, range) : null;
  const first = span?.first;
  const count = span?.count;
  useEffect(() => {
    const el = area.current;
    if (!el || !metrics || first === undefined || count === undefined) return;
    const top = metrics.paddingTop + first * metrics.lineHeight;
    const bottom = top + count * metrics.lineHeight;
    // Changing scrollTop fires a scroll event, which updates the band's position.
    if (top < el.scrollTop || bottom > el.scrollTop + el.clientHeight) {
      el.scrollTop = Math.max(0, top - metrics.lineHeight);
    }
  }, [metrics, first, count]);

  return {
    ref,
    onScroll: (event) => setScrollTop(event.currentTarget.scrollTop),
    band: span && metrics ? { span, ...metrics, scrollTop } : null,
  };
}
