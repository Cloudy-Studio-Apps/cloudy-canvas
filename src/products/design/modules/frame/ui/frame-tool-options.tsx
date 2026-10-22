import { ChevronDown, Frame } from "lucide-react";

import { FloatingPanel } from "@canvas-ui";
import { FRAME_PRESETS } from "@design";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { FramePresetMenu } from "./frame-preset-menu";

/** While the frame tool is on: the size a click places (drag to draw any size). */
export function FrameToolOptions() {
  const engine = useDesignEngine();
  const presetId = useDesignState((state) => state.options.framePreset);
  const preset = FRAME_PRESETS.find((item) => item.id === presetId);

  return (
    <FloatingPanel className="gap-2 px-2 text-xs text-muted-foreground">
      <span>Click to place</span>
      <FramePresetMenu
        onPick={(picked) => engine.setToolOptions({ framePreset: picked.id })}
        trigger={
          <button
            type="button"
            className="flex h-7 cursor-pointer items-center gap-1.5 rounded-sm px-2 text-foreground hover:bg-hover"
          >
            <Frame className="size-3.5" />
            {preset ? `${preset.label} · ${preset.size.w}×${preset.size.h}` : "Custom"}
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>
        }
      />
      <span>or drag to draw</span>
    </FloatingPanel>
  );
}
