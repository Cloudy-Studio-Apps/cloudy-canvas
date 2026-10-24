import { useState } from "react";

import { FieldBox } from "@shared/ui/kit";
import { ColorSlider } from "./color-slider";
import { HUE_TRACK } from "./color-constants";
import { hexToHsv, hsvToHex } from "./color-math";
import type { ColorChangeInfo, ColorControlsProps, Hsv } from "./color.types";
import { EyedropperButton } from "./eyedropper-button";
import { HexInput } from "./hex-input";
import { PercentInput } from "./percent-input";
import { SaturationArea } from "./saturation-area";

/**
 * One color, Figma's way: the saturation/brightness area, eyedropper, hue (and opacity) sliders,
 * then hex (and opacity) fields. Drags report `{ done: false }` steps, then `{ done: true }`.
 * Shared by every color in the app: paints, gradient stops, effects, board palettes.
 */
export function ColorControls({ color, opacity, onChange, label = "" }: ColorControlsProps) {
  // Kept as HSV so the hue survives grays and black, where the hex has none.
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(color));
  const [synced, setSynced] = useState(color);
  if (synced !== color) {
    setSynced(color);
    if (hsvToHex(hsv) !== color) setHsv(hexToHsv(color));
  }
  const alpha = opacity ?? 1;

  const setColor = (next: Hsv, info: ColorChangeInfo) => {
    const hex = hsvToHex(next);
    setHsv(next);
    setSynced(hex);
    onChange({ color: hex, opacity: alpha }, info);
  };
  const pick = (hex: string) => setColor(hexToHsv(hex), { done: true });
  const setOpacity = (value: number, info: ColorChangeInfo) =>
    onChange({ color, opacity: Math.round(value * 100) / 100 }, info);

  return (
    <div className="space-y-3">
      <SaturationArea hsv={hsv} onChange={setColor} />
      <div className="flex items-center gap-2">
        <EyedropperButton onPick={pick} />
        <div className="flex flex-1 flex-col gap-2">
          <ColorSlider
            label={`${label}Hue`}
            value={hsv.h / 360}
            track={HUE_TRACK}
            onChange={(h, info) => setColor({ ...hsv, h: h * 360 }, info)}
          />
          {opacity !== undefined && (
            <ColorSlider
              label={`${label}Opacity`}
              value={opacity}
              track={`linear-gradient(to right, transparent, ${color})`}
              checkered
              onChange={setOpacity}
            />
          )}
        </div>
      </div>
      <div className="flex gap-1.5">
        <FieldBox className="flex-1">
          <span className="text-subtle-foreground">Hex</span>
          <HexInput color={color} label={`${label}Hex color`} onCommit={pick} />
        </FieldBox>
        {opacity !== undefined && (
          <FieldBox className="w-16 gap-0.5">
            <PercentInput
              value={opacity}
              label={`${label}Opacity`}
              onCommit={(value) => setOpacity(value, { done: true })}
            />
          </FieldBox>
        )}
      </div>
    </div>
  );
}
