import { clamp, type Point } from "@canvas";
import type { LayerBlurEffect } from "../../effect.types";
import { HandleDot } from "./handle-dot";
import type { EffectHandlesProps } from "./handles.types";
import { t } from "../../effects.i18n";

/** A progressive blur's start and end as handles on the layer: drag them to lay the blur. */
export function BlurHandles({
  effect,
  screen,
  startDrag,
  change,
}: EffectHandlesProps<LayerBlurEffect>) {
  if (!effect.progressive) return null;
  const start = screen(effect.start);
  const end = screen(effect.end);
  const dragEnd = (which: "start" | "end") => (event: React.PointerEvent<SVGElement>) => {
    let first = true;
    startDrag(event, (p: Point) => {
      const at = { x: round(clamp(p.x, 0, 1)), y: round(clamp(p.y, 0, 1)) };
      change({ ...effect, [which]: at }, first);
      first = false;
    });
  };
  return (
    <>
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        strokeWidth={1.5}
        className="stroke-foreground/50"
      />
      <HandleDot at={start} label={t("handles.blurStart")} onPointerDown={dragEnd("start")} />
      <HandleDot at={end} label={t("handles.blurEnd")} onPointerDown={dragEnd("end")} />
    </>
  );
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
