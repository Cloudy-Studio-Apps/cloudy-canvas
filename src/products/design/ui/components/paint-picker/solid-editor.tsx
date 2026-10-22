import { useMemo, useState } from "react";

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
import { useDesignEngine } from "../../design-engine-context";
import { FieldBox } from "../panel/field-box";
import { HexInput } from "../panel/hex-input";
import { PercentInput } from "../panel/percent-input";
import { usePaintRecentsStore } from "../../stores/paint-recents-store";
import { ColorSwatches } from "./color-swatches";
import { pageColors } from "./page-colors";
import type { SolidEditorProps } from "./paint-picker.types";

/**
 * A solid color: the saturation/brightness area, eyedropper, hue and opacity sliders, hex and
 * opacity fields, then the page's colors and the recent ones.
 */
export function SolidEditor({ paint, onChange }: SolidEditorProps) {
  const engine = useDesignEngine();
  const recents = usePaintRecentsStore((state) => state.colors);
  const addRecent = usePaintRecentsStore((state) => state.add);
  const onPage = useMemo(() => pageColors(engine.elements()), [engine]);
  // Kept as HSV so the hue survives grays and black, where the hex has none.
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(paint.color));
  const [synced, setSynced] = useState(paint.color);
  if (synced !== paint.color) {
    setSynced(paint.color);
    if (hsvToHex(hsv) !== paint.color) setHsv(hexToHsv(paint.color));
  }

  const setColor = (next: Hsv, info: ColorChangeInfo) => {
    const color = hsvToHex(next);
    setHsv(next);
    setSynced(color);
    onChange({ ...paint, color }, info);
    if (info.done) addRecent(color);
  };
  const pick = (color: string) => setColor(hexToHsv(color), { done: true });
  const setOpacity = (opacity: number, info: ColorChangeInfo) =>
    onChange({ ...paint, opacity: Math.round(opacity * 100) / 100 }, info);

  return (
    <div className="space-y-3">
      <SaturationArea hsv={hsv} onChange={setColor} />
      <div className="flex items-center gap-2">
        <EyedropperButton onPick={pick} />
        <div className="flex flex-1 flex-col gap-2">
          <ColorSlider
            label="Hue"
            value={hsv.h / 360}
            track={HUE_TRACK}
            onChange={(h, info) => setColor({ ...hsv, h: h * 360 }, info)}
          />
          <ColorSlider
            label="Opacity"
            value={paint.opacity}
            track={`linear-gradient(to right, transparent, ${paint.color})`}
            checkered
            onChange={setOpacity}
          />
        </div>
      </div>
      <div className="flex gap-1.5">
        <FieldBox className="flex-1">
          <span className="text-subtle-foreground">Hex</span>
          <HexInput color={paint.color} label="Hex color" onCommit={pick} />
        </FieldBox>
        <FieldBox className="w-16 gap-0.5">
          <PercentInput
            value={paint.opacity}
            label="Opacity"
            onCommit={(value) => setOpacity(value, { done: true })}
          />
        </FieldBox>
      </div>
      <ColorSwatches title="On this page" colors={onPage} onPick={pick} />
      <ColorSwatches title="Recent" colors={recents} onPick={pick} />
    </div>
  );
}
