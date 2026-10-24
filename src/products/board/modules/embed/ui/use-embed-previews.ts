import { useEffect } from "react";

import { loadEmbedPreview, pendingEmbeds, type BoardEngine } from "@board";
import { useCanvasFile } from "@canvas-ui";
import { http } from "@platform";

/**
 * Fetches the previews of link cards still loading: pasted ones, and any a file was saved with.
 * In a live session only the host does (the previews reach the guests with the rest).
 */
export function useEmbedPreviews(engine: BoardEngine): void {
  const guest = useCanvasFile().live?.side === "guest";
  useEffect(() => {
    if (guest) return;
    // Keyed by link too, so a card given a new link (by an agent) loads again.
    const started = new Set<string>();
    const scan = () => {
      for (const el of pendingEmbeds(engine.doc.all())) {
        const key = `${el.id} ${el.url}`;
        if (started.has(key)) continue;
        started.add(key);
        void loadEmbedPreview(engine.doc, el, http);
      }
    };
    scan();
    return engine.doc.observe(scan);
  }, [engine, guest]);
}
