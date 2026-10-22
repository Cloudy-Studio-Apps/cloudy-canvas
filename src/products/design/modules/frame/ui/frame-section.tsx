import { ChevronDown, Frame } from "lucide-react";

import type { ElementPatch } from "@canvas";
import type { DesignNode, FrameElement } from "@design";
import { NodeCheckbox, PanelSection } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";
import { FramePresetMenu } from "./frame-preset-menu";

/** For selected frames: resize to a preset, and whether they clip their content. */
export function FrameSection({ selection: { nodes } }: PropertySectionProps) {
  const edit = useEditNodes();
  const frames = nodes as readonly FrameElement[];

  return (
    <PanelSection
      title="Frame"
      actions={
        <FramePresetMenu
          onPick={({ size }) => edit(frames, () => ({ w: size.w, h: size.h }))}
          trigger={
            <button
              type="button"
              className="flex h-6 cursor-pointer items-center gap-1 rounded-sm px-1.5 text-xs text-muted-foreground hover:bg-hover hover:text-foreground"
            >
              <Frame className="size-3" />
              Presets
              <ChevronDown className="size-3" />
            </button>
          }
        />
      }
    >
      <NodeCheckbox
        nodes={frames}
        label="Clip content"
        read={(frame) => frame.clipsContent}
        patch={(clipsContent) => ({ clipsContent }) as ElementPatch<DesignNode>}
      />
    </PanelSection>
  );
}
