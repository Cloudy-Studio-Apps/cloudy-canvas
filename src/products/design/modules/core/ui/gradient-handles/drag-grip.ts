import {
  clamp,
  screenLength,
  squareWidth,
  transformFromHandles,
  type GradientHandles,
  type Point,
  type Size,
} from "@canvas";
import type { GradientPaint } from "@design";

import type { GradientGrip } from "./gradient-handles.types";

/** Shift snaps the start–end line to steps of this many degrees. */
const ANGLE_STEP = 15;
/** The shortest a width handle gets, as a share of the start–end distance. */
const MIN_WIDTH_RATIO = 0.01;

/** `end` turned round `start` (on screen) to the nearest `ANGLE_STEP`. */
function snapAngle(start: Point, end: Point, size: Size): Point {
  const dx = (end.x - start.x) * size.w;
  const dy = (end.y - start.y) * size.h;
  const step = (ANGLE_STEP * Math.PI) / 180;
  const angle = Math.round(Math.atan2(dy, dx) / step) * step;
  const length = Math.hypot(dx, dy);
  return {
    x: start.x + (Math.cos(angle) * length) / Math.max(size.w, 1e-6),
    y: start.y + (Math.sin(angle) * length) / Math.max(size.h, 1e-6),
  };
}

/** How far `width` is from `start` compared with `end` (on screen). */
function widthRatio(h: GradientHandles, size: Size): number {
  const along = screenLength(h.start, h.end, size);
  return along > 0 ? screenLength(h.start, h.width, size) / along : 1;
}

/**
 * The gradient with `grip` dragged to `p` (normalized), as Figma does: a linear gradient's ends
 * move alone; a radial, angular or diamond one moves whole by its center, turns and grows by its
 * end (the width handle follows, square to it) and only grows across by its width handle. A stop
 * slides along the start–end line. Shift snaps the line's angle.
 */
export function dragGrip(
  paint: GradientPaint,
  start: GradientHandles,
  grip: GradientGrip,
  p: Point,
  size: Size,
  snap: boolean,
): GradientPaint {
  if (typeof grip === "object") {
    const d = {
      x: (start.end.x - start.start.x) * size.w,
      y: (start.end.y - start.start.y) * size.h,
    };
    const v = { x: (p.x - start.start.x) * size.w, y: (p.y - start.start.y) * size.h };
    const lengthSq = d.x * d.x + d.y * d.y;
    const raw = lengthSq > 0 ? (v.x * d.x + v.y * d.y) / lengthSq : 0;
    const position = Math.round(clamp(snap ? Math.round(raw * 20) / 20 : raw, 0, 1) * 1000) / 1000;
    const stops = paint.stops.map((s, i) => (i === grip.stop ? { ...s, position } : s));
    return { ...paint, stops };
  }
  const linear = paint.type === "linear";
  let next: GradientHandles;
  if (grip === "start") {
    const offset = { x: p.x - start.start.x, y: p.y - start.start.y };
    const shift = (q: Point) => ({ x: q.x + offset.x, y: q.y + offset.y });
    next = linear
      ? { ...start, start: snap ? snapAngle(start.end, p, size) : p }
      : { start: p, end: shift(start.end), width: shift(start.width) };
  } else if (grip === "end") {
    const end = snap ? snapAngle(start.start, p, size) : p;
    next = { ...start, end, width: squareWidth(start.start, end, size, widthRatio(start, size)) };
  } else {
    const along = screenLength(start.start, start.end, size);
    const across = squareWidth(start.start, start.end, size, 1);
    const unit = {
      x: (across.x - start.start.x) * size.w,
      y: (across.y - start.start.y) * size.h,
    };
    const v = { x: (p.x - start.start.x) * size.w, y: (p.y - start.start.y) * size.h };
    const ratio = along > 0 ? (v.x * unit.x + v.y * unit.y) / (along * along) : 1;
    next = {
      ...start,
      width: squareWidth(start.start, start.end, size, Math.max(MIN_WIDTH_RATIO, ratio)),
    };
  }
  return { ...paint, transform: transformFromHandles(paint.type, next, size, paint.transform) };
}
