import { ColorField, ColorSlider } from "@canvas-ui";
import { HARMONIES, hexToHsvColor, hsvToHexColor } from "../..";
import { applyHarmony, setColorAt, useColorWizardStore } from "../store";
import { ColorWheel } from "./color-wheel";
import { HarmonyPicker } from "./harmony-picker";

/** Adobe's way: a base color on the wheel, a harmony, and handles to drag. */
export function WheelSource() {
  const base = useColorWizardStore((s) => s.palette[0]?.hex ?? "#3A83C9");
  const harmony = useColorWizardStore((s) => s.harmony);
  const brightness = useColorWizardStore((s) => s.brightness);
  const set = useColorWizardStore((s) => s.set);
  const hsv = hexToHsvColor(base);
  const label = HARMONIES.find((h) => h.id === harmony)?.label;
  return (
    <div className="flex flex-col gap-3 p-4">
      <ColorWheel />
      <ColorSlider
        label="Brightness"
        value={brightness}
        track={`linear-gradient(to right, ${hsvToHexColor({ ...hsv, v: 0 })}, ${hsvToHexColor({ ...hsv, v: 1 })})`}
        onChange={(value, info) => {
          set({ brightness: value });
          if (!info.done) return;
          const palette = useColorWizardStore.getState().palette;
          if (harmony === "custom") {
            palette.forEach((c, i) =>
              setColorAt(i, hsvToHexColor({ ...hexToHsvColor(c.hex), v: value })),
            );
          } else applyHarmony({ ...hsv, v: value });
        }}
      />
      <ColorField
        label="Base color"
        color={base.toLowerCase()}
        onChange={(next, info) => {
          if (!info.done) return;
          const color = next.color.toUpperCase();
          if (harmony === "custom") setColorAt(0, color);
          else {
            set({ brightness: hexToHsvColor(color).v });
            applyHarmony(hexToHsvColor(color));
          }
        }}
      />
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Harmony
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <HarmonyPicker
        value={harmony}
        onChange={(next) => {
          set({ harmony: next });
          if (next !== "custom") applyHarmony({ ...hsv, v: brightness });
        }}
      />
      <p className="text-xs text-muted-foreground">
        Drag the large handle to move the base color; the others follow the harmony. In Custom,
        every handle moves on its own.
      </p>
    </div>
  );
}
