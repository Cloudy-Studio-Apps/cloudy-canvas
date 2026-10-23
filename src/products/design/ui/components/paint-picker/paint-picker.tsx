import { useState } from "react";
import { X } from "lucide-react";

import {
  gradientPaint,
  isGradientPaint,
  type GradientPaint,
  type ImagePaint,
  type SolidPaint,
} from "@design";
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
 * there; a new gradient starts from the paint's color, as Figma's does.
 */
export function PaintPicker({ paint, onChange, onClose, allowImage, size }: PaintPickerProps) {
  const [tab, setTab] = useState<PaintTab["id"]>(paint.type);
  const [lastSolid, setLastSolid] = useState<SolidPaint>(() =>
    paint.type === "solid"
      ? paint
      : { type: "solid", color: DEFAULT_SOLID, opacity: 1, visible: paint.visible },
  );
  const [lastImage, setLastImage] = useState<ImagePaint | null>(() =>
    paint.type === "image" ? paint : null,
  );

  const pickTab = (next: PaintTab["id"]) => {
    setTab(next);
    if (next === paint.type) return;
    if (next === "solid") onChange(lastSolid, { done: true });
    if (next === "image" && lastImage) onChange(lastImage, { done: true });
    if (isGradientTab(next)) onChange(gradientPaint(next, paint), { done: true });
  };

  const title = PAINT_TABS.find((t) => t.id === tab)?.label ?? "Paint";

  return (
    <div className="w-60 space-y-3 p-3">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
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
            onChange(next, info);
          }}
        />
      )}
    </div>
  );
}
