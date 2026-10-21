import { useEffect } from "react";

import { loadEmbedPreview, pendingEmbeds, type BoardEngine } from "@board";
import { http } from "@platform";

/** Fetches the previews of link cards still loading: pasted ones, and any a file was saved with. */
export function useEmbedPreviews(engine: BoardEngine): void {
  useEffect(() => {
    const started = new Set<string>();
    const scan = () => {
      for (const el of pendingEmbeds(engine.doc.all())) {
        if (started.has(el.id)) continue;
        started.add(el.id);
        void loadEmbedPreview(engine.doc, el, http);
      }
    };
    scan();
    return engine.doc.observe(scan);
  }, [engine]);
}
