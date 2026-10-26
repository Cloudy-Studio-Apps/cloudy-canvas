import { useCallback } from "react";

import { createPresetFrame } from "../create-preset-frame";
import type { FramePreset } from "../frame.types";
import { useDesignEngine } from "@design/ui/design-engine-context";

/**
 * Adds a frame of a preset's size next to the page's content (one undo step), named after the
 * preset, then selects it, zooms to it and goes back to the select tool. The preset also becomes
 * the one a click with the frame tool places.
 */
export function useAddPresetFrame(): (preset: FramePreset) => void {
  const engine = useDesignEngine();
  return useCallback(
    (preset) => {
      const { doc } = engine;
      const frame = createPresetFrame(preset, doc, engine.elements());
      doc.checkpoint();
      doc.add(frame);
      engine.setToolOptions({ framePreset: preset.id });
      engine.setTool("select");
      engine.zoomToElement(frame.id);
    },
    [engine],
  );
}
