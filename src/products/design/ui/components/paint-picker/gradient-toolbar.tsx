import { ArrowLeftRight, Blend, Copy, Plus, RotateCw } from "lucide-react";

import { reverseStops, rotateGradient90, withInterpolation } from "@canvas";
import { PanelIconButton } from "../panel/panel-section";
import type { GradientToolbarProps } from "./gradient-toolbar.types";

/** The gradient's actions: add a stop, reverse it, turn it, blend smoothly and copy it as CSS. */
export function GradientToolbar({ paint, onChange, onAddStop, onCopy }: GradientToolbarProps) {
  const done = { done: true };
  const smooth = paint.interpolation === "oklab";
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-xs text-muted-foreground">Stops</h3>
      <div className="flex items-center gap-0.5">
        <PanelIconButton label="Copy as CSS" onClick={onCopy}>
          <Copy />
        </PanelIconButton>
        <PanelIconButton
          label="Smooth blending"
          active={smooth}
          onClick={() => onChange(withInterpolation(paint, smooth ? "srgb" : "oklab"), done)}
        >
          <Blend />
        </PanelIconButton>
        <PanelIconButton
          label="Rotate 90°"
          onClick={() => onChange({ ...paint, transform: rotateGradient90(paint.transform) }, done)}
        >
          <RotateCw />
        </PanelIconButton>
        <PanelIconButton
          label="Reverse"
          onClick={() => onChange({ ...paint, stops: reverseStops(paint.stops) }, done)}
        >
          <ArrowLeftRight />
        </PanelIconButton>
        <PanelIconButton label="Add stop" onClick={onAddStop}>
          <Plus />
        </PanelIconButton>
      </div>
    </div>
  );
}
