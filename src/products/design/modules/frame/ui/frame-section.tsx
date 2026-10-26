import { ChevronDown, Frame } from "lucide-react";

import type { ElementPatch } from "@canvas";
import type { DesignNode } from "../../core";
import type { FrameElement } from "../frame.types";
import { BindSlot, NodeCheckbox, PanelSection } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import { Button } from "@shared/ui/kit";
import type { PropertySectionProps } from "@design/ui/modules";
import { FramePresetPicker } from "./frame-preset-picker";

/** For selected frames: resize to a preset, and whether they clip their content. */
export function FrameSection({ selection: { nodes } }: PropertySectionProps) {
  const edit = useEditNodes();
  const frames = nodes as readonly FrameElement[];

  return (
    <PanelSection
      title="Frame"
      actions={
        <FramePresetPicker
          onPick={({ size }) => edit(frames, () => ({ w: size.w, h: size.h }))}
          trigger={
            <Button variant="ghost" size="xs">
              <Frame />
              Presets
              <ChevronDown />
            </Button>
          }
        />
      }
    >
      <BindSlot nodes={frames} path="clipsContent">
        <NodeCheckbox
          nodes={frames}
          label="Clip content"
          read={(frame) => frame.clipsContent}
          patch={(clipsContent) => ({ clipsContent }) as ElementPatch<DesignNode>}
        />
      </BindSlot>
    </PanelSection>
  );
}
