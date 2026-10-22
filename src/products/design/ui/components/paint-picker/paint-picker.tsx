import { useState } from "react";
import { X } from "lucide-react";

import type { ImagePaint, SolidPaint } from "@design";
import { ImageEditor } from "./image-editor";
import type { PaintPickerProps, PaintTab } from "./paint-picker.types";
import { PaintTabs } from "./paint-tabs";
import { SolidEditor } from "./solid-editor";

/** The color a solid tab starts with when the paint was an image. */
const DEFAULT_SOLID = "#D9D9D9";

/**
 * Edits one fill or stroke, like Figma's paint picker: a tab per kind of paint (solid and image
 * for now), then that paint's editor. Switching tabs brings back the paint last used there.
 */
export function PaintPicker({ paint, onChange, onClose, allowImage }: PaintPickerProps) {
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
    if (next === "solid" && paint.type !== "solid") onChange(lastSolid, { done: true });
    if (next === "image" && paint.type !== "image" && lastImage)
      onChange(lastImage, { done: true });
  };

  return (
    <div className="w-60 space-y-3 p-3">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{tab === "image" ? "Image" : "Solid"}</h2>
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
