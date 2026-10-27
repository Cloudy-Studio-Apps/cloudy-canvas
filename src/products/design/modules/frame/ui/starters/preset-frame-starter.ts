import type { DesignStarter } from "../../../core/ui";
import { createPresetFrame } from "../../create-preset-frame";
import { findPreset } from "../../frame-presets";

/** A starter that begins with one frame of a preset's size, shown in the view. */
export function presetFrameStarter(
  starter: Omit<DesignStarter, "start">,
  presetId: string,
): DesignStarter {
  return {
    ...starter,
    start: (engine) => {
      const preset = findPreset(presetId);
      if (!preset) return;
      const frame = createPresetFrame(preset, engine.doc, engine.elements());
      engine.doc.add(frame);
      engine.zoomToElement(frame.id);
    },
  };
}
