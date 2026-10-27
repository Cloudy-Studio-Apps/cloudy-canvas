import { useRef, type PointerEvent as ReactPointerEvent } from "react";

import { addStop, clamp, removeStop } from "@canvas";
import { CHECKERBOARD } from "@canvas-ui";
import { cn } from "@shared/ui/lib/utils";
import type { GradientStopBarProps } from "./paint-picker.types";
import { stopRampCss } from "./stop-ramp";
import { t } from "../../design-ui.i18n";

/** Pixels a stop is dragged off the bar to remove it. */
const REMOVE_DISTANCE = 32;
/** What Shift snaps a dragged stop's position to. */
const SNAP = 0.05;

/**
 * The gradient's stops on a strip of its colors: click the strip to add a stop there, drag a stop
 * to move it (Shift snaps to 5%), drag it off the strip or press Delete to remove it.
 */
export function GradientStopBar({ paint, selected, onSelect, onChange }: GradientStopBarProps) {
  const strip = useRef<HTMLDivElement>(null);
  const positionAt = (clientX: number, snap: boolean) => {
    const rect = strip.current!.getBoundingClientRect();
    const position = clamp((clientX - rect.left) / Math.max(rect.width, 1), 0, 1);
    return Math.round((snap ? Math.round(position / SNAP) * SNAP : position) * 1000) / 1000;
  };

  const add = (event: ReactPointerEvent) => {
    if (event.button !== 0) return;
    const { stops, index } = addStop(
      paint.stops,
      positionAt(event.clientX, event.shiftKey),
      paint.interpolation,
    );
    onChange({ ...paint, stops }, { done: true });
    onSelect(index);
  };

  const remove = (index: number) => {
    if (paint.stops.length <= 2) return;
    onChange({ ...paint, stops: removeStop(paint.stops, index) }, { done: true });
    onSelect(Math.max(0, index - 1));
  };

  const drag = (event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    onSelect(index);
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    const top = strip.current!.getBoundingClientRect().top;
    let current = paint;
    let moved = false;
    const move = (e: PointerEvent) => {
      moved = true;
      const away = Math.abs(e.clientY - top) > REMOVE_DISTANCE && paint.stops.length > 2;
      const stops = away
        ? removeStop(paint.stops, index)
        : paint.stops.map((stop, i) =>
            i === index ? { ...stop, position: positionAt(e.clientX, e.shiftKey) } : stop,
          );
      current = { ...paint, stops };
      onChange(current, { done: false });
    };
    const end = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", end);
      target.removeEventListener("pointercancel", end);
      if (!moved) return;
      onChange(current, { done: true });
      if (current.stops.length < paint.stops.length) onSelect(Math.max(0, index - 1));
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", end);
    target.addEventListener("pointercancel", end);
  };

  return (
    <div className="relative px-1.5 py-1">
      <div
        ref={strip}
        role="presentation"
        onPointerDown={add}
        className="relative h-5 cursor-copy rounded-sm border border-border-strong"
        style={{ background: `${stopRampCss(paint)}, ${CHECKERBOARD}` }}
      >
        {paint.stops.map((stop, i) => (
          // eslint-disable-next-line no-restricted-syntax -- bespoke: a gradient stop handle
          <button
            key={i}
            type="button"
            aria-label={t("gradient.stop.at", {
              percent: Math.round(stop.position * 100),
            })}
            aria-pressed={i === selected}
            onPointerDown={(event) => drag(event, i)}
            onKeyDown={(event) => {
              if (event.key === "Delete" || event.key === "Backspace") remove(i);
            }}
            className={cn(
              "absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-xs border-2 border-surface shadow-sm outline-none",
              i === selected && "ring-2 ring-primary",
            )}
            style={{ left: `${stop.position * 100}%`, background: stop.color }}
          />
        ))}
      </div>
    </div>
  );
}
