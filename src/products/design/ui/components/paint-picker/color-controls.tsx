import { useState } from "react";

import {
  ColorSlider,
  EyedropperButton,
  hexToHsv,
  hsvToHex,
  HUE_TRACK,
  SaturationArea,
  type ColorChangeInfo,
  type Hsv,
} from "@canvas-ui";
import { FieldBox } from "../panel/field-box";
import { HexInput } from "../panel/hex-input";
import { PercentInput } from "../panel/percent-input";
import type { ColorControlsProps } from "./paint-picker.types";

/**
 * One color with its opacity: the saturation/brightness area, eyedropper, hue and opacity
 * sliders, then hex and opacity fields. Shared by solid paints and gradient stops.
 */
export function ColorControls({ color, opacity, onChange, label = "" }: ColorControlsProps) {
  // Kept as HSV so the hue survives grays and black, where the hex has none.
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(color));
  const [synced, setSynced] = useState(color);
  if (synced !== color) {
    setSynced(color);
    if (hsvToHex(hsv) !== color) setHsv(hexToHsv(color));
  }

  const setColor = (next: Hsv, info: ColorChangeInfo) => {
    const hex = hsvToHex(next);
    setHsv(next);
    setSynced(hex);
    onChange({ color: hex, opacity }, info);
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
          <ColorSlider
            label={`${label}Opacity`}
            value={opacity}
            track={`linear-gradient(to right, transparent, ${color})`}
            checkered
            onChange={setOpacity}
          />
        </div>
      </div>
      <div className="flex gap-1.5">
        <FieldBox className="flex-1">
          <span className="text-subtle-foreground">Hex</span>
          <HexInput color={color} label={`${label}Hex color`} onCommit={pick} />
        </FieldBox>
        <FieldBox className="w-16 gap-0.5">
          <PercentInput
            value={opacity}
            label={`${label}Opacity`}
            onCommit={(value) => setOpacity(value, { done: true })}
          />
        </FieldBox>
      </div>
    </div>
  );
}
