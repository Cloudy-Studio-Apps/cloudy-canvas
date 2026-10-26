import { useState } from "react";

import { FRAME_PRESET_GROUPS, FRAME_PRESETS } from "../frame-presets";
import { PanelSection } from "@design/ui/components/panel";
import { useDesignState } from "@design/ui/design-engine-context";
import { FramePresetGroup } from "./frame-preset-group";
import { useAddPresetFrame } from "./use-add-preset-frame";

/**
 * The properties panel while the frame tool is on (as in Figma): the preset sizes by group. A
 * preset adds a frame of its size next to the content; dragging on the canvas draws any size.
 */
export function FramePresetsSidebar() {
  const current = useDesignState((state) => state.options.framePreset);
  const addFrame = useAddPresetFrame();
  // The group of the preset used last starts open.
  const [open, setOpen] = useState<ReadonlySet<string>>(() => {
    const group = FRAME_PRESETS.find((preset) => preset.id === current)?.group;
    return new Set(group ? [group] : []);
  });

  const toggle = (group: string) =>
    setOpen((before) => {
      const next = new Set(before);
      if (!next.delete(group)) next.add(group);
      return next;
    });

  return (
    <PanelSection title="Frame" className="border-b-0">
      <p className="mb-2 text-xs text-muted-foreground">
        Pick a size to add a frame, or drag on the canvas to draw one.
      </p>
      <ul className="flex flex-col">
        {FRAME_PRESET_GROUPS.map((group) => (
          <FramePresetGroup
            key={group.group}
            group={group}
            open={open.has(group.group)}
            onToggle={() => toggle(group.group)}
            current={current}
            onPick={addFrame}
          />
        ))}
      </ul>
    </PanelSection>
  );
}
