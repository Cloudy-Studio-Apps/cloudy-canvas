import { useCallback } from "react";

import { createFrame, nextLayerName, presetFrameRect, type FramePreset } from "@design";
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
      const rect = presetFrameRect(preset.size, engine.elements());
      const frame = createFrame(
        rect,
        nextLayerName(doc.all(), preset.label),
        doc.nextIndex(),
        null,
      );
      doc.checkpoint();
      doc.add(frame);
      engine.setToolOptions({ framePreset: preset.id });
      engine.setTool("select");
      engine.zoomToElement(frame.id);
    },
    [engine],
  );
}
