import { useEffect, useSyncExternalStore } from "react";

import { useService } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { DESIGN_BROCHURES } from "../../model/design-brochures";
import { brochureFrameTags } from "../../model/repeats";
import { showFrameTags } from "../canvas/shown-frame-tags";

/**
 * Keeps the words after the brochure page frames' names up to date while a design is open, in
 * every mode (`brochureFrameTags`, from the remembered expansions, once per document change), and
 * draws again only the frames whose words changed. Closing the design clears them.
 */
export function useFrameLabelTags(): void {
  const engine = useDesignEngine();
  const brochures = useService(DESIGN_BROCHURES);
  const version = useSyncExternalStore(brochures.subscribe, brochures.getVersion);
  useEffect(() => {
    // Frames off the page on screen are drawn with their words when the page is shown.
    const changed = showFrameTags(brochureFrameTags(engine.doc)).filter((id) =>
      engine.getElement(id),
    );
    if (changed.length > 0) engine.refreshElements(changed);
  }, [engine, version]);
  useEffect(() => () => void showFrameTags(new Map()), [engine]);
}
