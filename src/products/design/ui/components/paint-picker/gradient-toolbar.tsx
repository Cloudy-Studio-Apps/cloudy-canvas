import { ArrowLeftRight, Blend, Copy, Plus, RotateCw } from "lucide-react";

import { reverseStops, rotateGradient90, withInterpolation } from "@canvas";
import { PanelIconButton } from "../panel/panel-section";
import type { GradientToolbarProps } from "./gradient-toolbar.types";
import { t } from "../../design-ui.i18n";

/** The gradient's actions: add a stop, reverse it, turn it, blend smoothly and copy it as CSS. */
export function GradientToolbar({ paint, onChange, onAddStop, onCopy }: GradientToolbarProps) {
  const done = { done: true };
  const smooth = paint.interpolation === "oklab";
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-xs text-muted-foreground">{t("gradient.stops")}</h3>
      <div className="flex items-center gap-0.5">
        <PanelIconButton label={t("gradient.toolbar.copyCss")} onClick={onCopy}>
          <Copy />
        </PanelIconButton>
        <PanelIconButton
          label={t("gradient.toolbar.smooth")}
          active={smooth}
          onClick={() => onChange(withInterpolation(paint, smooth ? "srgb" : "oklab"), done)}
        >
          <Blend />
        </PanelIconButton>
        <PanelIconButton
          label={t("gradient.toolbar.rotate90")}
          onClick={() => onChange({ ...paint, transform: rotateGradient90(paint.transform) }, done)}
        >
          <RotateCw />
        </PanelIconButton>
        <PanelIconButton
          label={t("gradient.toolbar.reverse")}
          onClick={() => onChange({ ...paint, stops: reverseStops(paint.stops) }, done)}
        >
          <ArrowLeftRight />
        </PanelIconButton>
        <PanelIconButton label={t("gradient.toolbar.addStop")} onClick={onAddStop}>
          <Plus />
        </PanelIconButton>
      </div>
    </div>
  );
}
