import { ChevronDown, Frame } from "lucide-react";

import type { ElementPatch } from "@canvas";
import type { FrameElement } from "@design";
import { PanelSection } from "@design/ui/components/panel";
import { useEditNodes } from "@design/ui/hooks";
import type { PropertySectionProps } from "@design/ui/modules";
import { FramePresetMenu } from "./frame-preset-menu";

/** For selected frames: resize to a preset, and whether they clip their content. */
export function FrameSection({ selection: { nodes } }: PropertySectionProps) {
  const edit = useEditNodes();
  const frames = nodes as readonly FrameElement[];
  const clips = frames.every((frame) => frame.clipsContent);

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
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={clips}
          onChange={() =>
            edit(frames, () => ({ clipsContent: !clips }) as ElementPatch<FrameElement>)
          }
          className="accent-primary"
        />
        Clip content
      </label>
    </PanelSection>
  );
}
