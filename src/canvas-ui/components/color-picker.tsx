import { useColorRecentsStore } from "@shared/stores/color-recents-store";
import { ColorControls, ColorSwatches } from "./color";
import type { ColorPickerProps } from "./color-picker.types";

/**
 * Picks any color, Figma's way (`ColorControls`: the area, hue, eyedropper and hex), then the
 * colors picked last anywhere in the app. Every step of a drag is reported with `{ done: false }`
 * and its end with `{ done: true }`; the end is remembered as a recent color.
 */
export function ColorPicker({ color, onChange, opacity, extra }: ColorPickerProps) {
  const recents = useColorRecentsStore((state) => state.colors);
  const addRecent = useColorRecentsStore((state) => state.add);
  return (
    <div className="space-y-3">
      <ColorControls
        color={color}
        opacity={opacity}
        onChange={(next, info) => {
          onChange(next.color, info, next.opacity);
          if (info.done) addRecent(next.color);
        }}
      />
      {extra}
      <ColorSwatches
        title="Recent"
        colors={recents}
        onPick={(picked) => {
          onChange(picked, { done: true }, opacity ?? 1);
          addRecent(picked);
        }}
      />
    </div>
  );
}
