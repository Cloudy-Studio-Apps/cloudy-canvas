import { useEffect, useRef } from "react";

import { cn } from "@shared/ui/kit";
import { hexToHsvColor, simulateCvd } from "../..";
import { useColorWizardStore } from "../store";
import { drawWheel } from "./draw-wheel";
import { useWheelDrag } from "./use-wheel-drag";
import { t } from "../../color-wizard.i18n";

const SIZE = 300;

/** The color wheel with a handle per palette color (the base larger) and lines from the middle. */
export function ColorWheel() {
  const palette = useColorWizardStore((s) => s.palette);
  const brightness = useColorWizardStore((s) => s.brightness);
  const cvd = useColorWizardStore((s) => s.cvd);
  const canvas = useRef<HTMLCanvasElement>(null);
  const wheel = useRef<HTMLDivElement>(null);
  const drag = useWheelDrag(wheel);
  useEffect(() => {
    if (canvas.current) drawWheel(canvas.current, brightness);
  }, [brightness]);
  const spots = palette.map((c) => {
    const { h, s } = hexToHsvColor(c.hex);
    const a = (h * Math.PI) / 180;
    return {
      x: SIZE / 2 + Math.cos(a) * s * (SIZE / 2),
      y: SIZE / 2 + Math.sin(a) * s * (SIZE / 2),
    };
  });
  return (
    <div ref={wheel} className="relative mx-auto my-1.5 size-[300px] touch-none select-none">
      <canvas ref={canvas} width={600} height={600} className="size-full rounded-full" />
      <svg
        className="pointer-events-none absolute inset-0 text-surface"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      >
        {spots.map((p, i) => (
          <line
            key={i}
            x1={SIZE / 2}
            y1={SIZE / 2}
            x2={p.x}
            y2={p.y}
            stroke="currentColor"
            strokeWidth={1.5}
            opacity={0.8}
          />
        ))}
      </svg>
      {palette.map((c, i) => (
        <span
          key={i}
          role="slider"
          aria-label={
            i === 0 ? t("sources.wheel.baseColor") : t("palette.swatch.colorN", { n: i + 1 })
          }
          aria-valuetext={c.hex}
          aria-valuenow={i}
          tabIndex={-1}
          onPointerDown={drag(i)}
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-surface shadow-popover active:cursor-grabbing",
            i === 0 ? "size-7.5 border-3" : "size-5.5",
            c.locked && "cursor-not-allowed",
          )}
          style={{
            left: `${(spots[i]!.x / SIZE) * 100}%`,
            top: `${(spots[i]!.y / SIZE) * 100}%`,
            background: simulateCvd(c.hex, cvd),
          }}
        />
      ))}
    </div>
  );
}
