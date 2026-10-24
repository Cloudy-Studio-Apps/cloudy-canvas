import { useState } from "react";
import { X } from "lucide-react";

import {
  gradientPaint,
  isGradientPaint,
  type GradientPaint,
  type ImagePaint,
  withBlendMode,
  type LayerBlendMode,
  type Paint,
  type SolidPaint,
} from "@design";
import { BlendModeSelect } from "../panel";
import { GradientEditor } from "./gradient-editor";
import { ImageEditor } from "./image-editor";
import type { PaintPickerProps, PaintTab } from "./paint-picker.types";
import { PaintTabs } from "./paint-tabs";
import { PAINT_TABS } from "./paint-tabs-data";
import { SolidEditor } from "./solid-editor";

/** The color a solid tab starts with when the paint was an image. */
const DEFAULT_SOLID = "#D9D9D9";

type GradientTab = GradientPaint["type"];

function isGradientTab(tab: PaintTab["id"]): tab is GradientTab {
  return tab === "linear" || tab === "radial" || tab === "angular" || tab === "diamond";
}

/**
 * Edits one fill or stroke, like Figma's paint picker: a tab per kind of paint (solid, the four
 * gradients and image), then that paint's editor. Switching tabs brings back the paint last used
 * there; a new gradient starts from the paint's color, as Figma's does. The header's menu sets the
 * paint's blend mode, which stays when the tab changes.
 */
export function PaintPicker({ paint, onChange, onClose, allowImage, size }: PaintPickerProps) {
  const [tab, setTab] = useState<PaintTab["id"]>(paint.type);
  const [lastSolid, setLastSolid] = useState<SolidPaint>(() =>
    paint.type === "solid"
      ? paint
      : { type: "solid", color: DEFAULT_SOLID, opacity: 1, visible: paint.visible },
  );
  // A placeholder takes the color the layer had (or was given here) before it became an image.
  const [solidColor, setSolidColor] = useState(() =>
    paint.type === "solid" ? paint.color : undefined,
  );
  const [lastImage, setLastImage] = useState<ImagePaint | null>(() =>
    paint.type === "image" ? paint : null,
  );

  /** A paint of another tab, blending as this one does. */
  const blended = <P extends Paint>(next: P): P => withBlendMode(next, paint.blendMode);

  const pickTab = (next: PaintTab["id"]) => {
    setTab(next);
    if (next === paint.type) return;
    if (next === "solid") onChange(blended(lastSolid), { done: true });
    if (next === "image" && lastImage) onChange(blended(lastImage), { done: true });
    if (isGradientTab(next)) onChange(blended(gradientPaint(next, paint)), { done: true });
  };

  const setBlendMode = (mode: LayerBlendMode) =>
    onChange(withBlendMode(paint, mode === "pass-through" ? undefined : mode), { done: true });

  const title = PAINT_TABS.find((t) => t.id === tab)?.label ?? "Paint";

  return (
    <div className="w-60 space-y-3 p-3">
      <header className="flex items-center gap-1">
        <h2 className="text-sm font-semibold">{title}</h2>
        <div className="ml-auto w-28">
          <BlendModeSelect
            value={paint.blendMode ?? "normal"}
            onChange={setBlendMode}
            passThrough={false}
            label="Paint blend mode"
          />
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex size-6 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-hover hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </header>
      <PaintTabs active={tab} onPick={pickTab} allowImage={allowImage} />
      {tab === "image" ? (
        <ImageEditor
          paint={paint.type === "image" ? paint : lastImage}
          onChange={(next) => {
            setLastImage(next);
            onChange(next, { done: true });
          }}
          size={size}
          placeholderColor={solidColor}
        />
      ) : isGradientTab(tab) ? (
        <GradientEditor
          paint={isGradientPaint(paint) ? paint : gradientPaint(tab, paint)}
          onChange={onChange}
          size={size}
        />
      ) : (
        <SolidEditor
          paint={paint.type === "solid" ? paint : lastSolid}
          onChange={(next, info) => {
            setLastSolid(next);
            setSolidColor(next.color);
            onChange(next, info);
          }}
        />
      )}
    </div>
  );
}
