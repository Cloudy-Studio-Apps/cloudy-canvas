import { clamp, mod } from "@canvas";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";

import { harmonize, hexToHsvColor, hsvToHexColor } from "../..";
import { useColorWizardStore } from "../store";

/**
 * Dragging a wheel handle: in Custom it moves that color alone; in a harmony, the base handle
 * moves the base and any other turns the base by as much, the rest following. The drag is one
 * step of the wizard's history.
 */
export function useWheelDrag(wheel: RefObject<HTMLDivElement | null>) {
  return (index: number) => (event: ReactPointerEvent<HTMLElement>) => {
    const store = useColorWizardStore.getState();
    const start = store.palette;
    if (start[index]?.locked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const from = hexToHsvColor(start[index]!.hex);
    const base0 = hexToHsvColor(start[0]!.hex);
    let moved = false;
    const target = event.currentTarget;
    const move = (e: PointerEvent) => {
      const rect = wheel.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = e.clientX - rect.left - rect.width / 2;
      const dy = e.clientY - rect.top - rect.height / 2;
      const s = clamp(Math.hypot(dx, dy) / (rect.width / 2), 0, 1);
      const h = mod((Math.atan2(dy, dx) * 180) / Math.PI, 360);
      const { harmony, brightness, palette, set } = useColorWizardStore.getState();
      moved = true;
      if (harmony === "custom") {
        const v = hexToHsvColor(start[index]!.hex).v;
        set({
          palette: palette.map((c, i) =>
            i === index ? { ...c, hex: hsvToHexColor({ h, s, v }) } : c,
          ),
        });
        return;
      }
      const base =
        index === 0
          ? { h, s, v: brightness }
          : {
              h: mod(base0.h + h - from.h, 360),
              s: clamp(base0.s + s - from.s, 0, 1),
              v: brightness,
            };
      const hsvs = harmonize(base, harmony, palette.length);
      set({
        palette: palette.map((c, i) => (c.locked ? c : { ...c, hex: hsvToHexColor(hsvs[i]!) })),
      });
    };
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      if (!moved) return;
      const { past, palette, set } = useColorWizardStore.getState();
      set({ palette, past: [...past, start].slice(-100), future: [], roles: [], picked: null });
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
  };
}
