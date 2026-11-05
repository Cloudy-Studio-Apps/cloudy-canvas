import { useEffect } from "react";

import type { DocumentChange } from "@canvas";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { BROCHURE_TYPE } from "../../brochure";
import { brochureFrameTags } from "../../model/repeats";
import { showFrameTags } from "../canvas/shown-frame-tags";

/**
 * Keeps the words after the brochure page frames' names up to date while a design is open, in
 * every mode (`brochureFrameTags`, from the remembered expansions), and draws again only the
 * frames whose words changed. Worked out once after each document change while some page has
 * words; while none has, only a change to a brochure record wakes it, so a design without
 * repeats never reads its brochures. Closing the design clears them.
 */
export function useFrameLabelTags(): void {
  const engine = useDesignEngine();
  useEffect(() => {
    const { doc } = engine;
    let active = false;
    let queued = false;
    let closed = false;
    const refresh = () => {
      queued = false;
      if (closed) return;
      const tags = brochureFrameTags(doc);
      active = tags.size > 0;
      // Frames off the page on screen are drawn with their words when the page is shown.
      const changed = showFrameTags(tags).filter((id) => engine.getElement(id));
      if (changed.length > 0) engine.refreshElements(changed);
    };
    const touchesBrochure = (change: DocumentChange) =>
      [...change.updated].some((id) => doc.field(id, "type") === BROCHURE_TYPE);
    const off = doc.observe((change) => {
      if (queued || !(active || touchesBrochure(change))) return;
      // After the change is through (the engine has its scene), once per burst of changes.
      queued = true;
      queueMicrotask(refresh);
    });
    refresh();
    return () => {
      closed = true;
      off();
      showFrameTags(new Map());
    };
  }, [engine]);
}
