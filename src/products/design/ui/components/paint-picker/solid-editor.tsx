import { useMemo, useState } from "react";

import {
  ColorSlider,
  EyedropperButton,
  hexToHsv,
  hsvToHex,
  HUE_TRACK,
  normalizeHex,
  SaturationArea,
  useCommitField,
  type ColorChangeInfo,
  type Hsv,
} from "@canvas-ui";
import { useDesignEngine } from "../../design-engine-context";
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

  const hex = useCommitField(paint.color.replace("#", "").toUpperCase(), (draft) => {
    const color = normalizeHex(draft);
    if (!color) return "Enter a hex color, like FF8800";
    pick(color);
  });
  const opacity = useCommitField(String(Math.round(paint.opacity * 100)), (draft) => {
    const value = Number(draft.trim());
    if (draft.trim() === "" || !Number.isFinite(value)) return "Enter a percentage";
    setOpacity(Math.min(100, Math.max(0, value)) / 100, { done: true });
  });

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
      <div className="flex gap-1.5 text-xs">
        <label className="flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-sm border border-transparent bg-muted px-2 focus-within:border-ring focus-within:bg-surface hover:border-border">
          <span className="text-subtle-foreground">Hex</span>
          <input
            aria-label="Hex color"
            aria-invalid={hex.error ? true : undefined}
            title={hex.error ?? undefined}
            value={hex.draft}
            spellCheck={false}
            onChange={(event) => hex.setDraft(event.target.value)}
            onFocus={hex.onFocus}
            onBlur={hex.onBlur}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") hex.revert();
            }}
            className="min-w-0 flex-1 bg-transparent font-mono text-foreground uppercase outline-none"
          />
        </label>
        <label className="flex h-7 w-16 items-center gap-0.5 rounded-sm border border-transparent bg-muted px-2 tabular-nums focus-within:border-ring focus-within:bg-surface hover:border-border">
          <input
            aria-label="Opacity"
            aria-invalid={opacity.error ? true : undefined}
            title={opacity.error ?? undefined}
            inputMode="decimal"
            value={opacity.draft}
            onChange={(event) => opacity.setDraft(event.target.value)}
            onFocus={opacity.onFocus}
            onBlur={opacity.onBlur}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") opacity.revert();
            }}
            className="w-full min-w-0 bg-transparent text-foreground outline-none"
          />
          <span className="text-subtle-foreground">%</span>
        </label>
      </div>
      <ColorSwatches title="On this page" colors={onPage} onPick={pick} />
      <ColorSwatches title="Recent" colors={recents} onPick={pick} />
    </div>
  );
}
