import type { Point, Size } from "../geometry.types";
import { cssColor } from "./css-color";
import { sampleStops, sortStops } from "./gradient-stops";
import { gradientHandles, screenLength } from "./gradient-transforms";
import type { Rgba } from "./gradient-color.types";
import type { Gradient } from "./gradient.types";

/** Colors sampled per blend when CSS can't draw it as is (eased, or mixed in OKLab). */
const SAMPLES_PER_BLEND = 8;

/** The stops CSS draws, `opacity` applied: the gradient's own, or samples of its blends. */
function cssStops(gradient: Gradient, opacity: number): { position: number; color: Rgba }[] {
  const sorted = sortStops(gradient.stops);
  const exact =
    (gradient.interpolation ?? "srgb") === "srgb" &&
    sorted.every((stop) => !stop.ease || stop.ease === "linear");
  const positions = exact
    ? sorted.map((stop) => stop.position)
    : sorted.flatMap((stop, i) => {
        const next = sorted[i + 1];
        if (!next) return [stop.position];
        return Array.from(
          { length: SAMPLES_PER_BLEND },
          (_, k) => stop.position + ((next.position - stop.position) * k) / SAMPLES_PER_BLEND,
        );
      });
  return positions.map((position) => {
    const color = sampleStops(sorted, position, gradient.interpolation);
    return { position, color: { ...color, a: color.a * opacity } };
  });
}

function percent(value: number): string {
  return `${Math.round(value * 10000) / 100}%`;
}

function degrees(radians: number): number {
  const deg = Math.round(((radians * 180) / Math.PI) * 100) / 100;
  return ((deg % 360) + 360) % 360;
}

/**
 * The gradient as a CSS `background` image on a box of `size` (proportions are what matter):
 * linear as `linear-gradient`, radial as `radial-gradient` (turned ellipses keep their radii but
 * not their turn), angular as `conic-gradient`; diamonds, which CSS has no gradient for, are drawn
 * as radial ones.
 */
export function gradientCss(gradient: Gradient, size: Size = { w: 1, h: 1 }, opacity = 1): string {
  const handles = gradientHandles(gradient.type, gradient.transform);
  const stops = cssStops(gradient, opacity);
  const px = (p: Point): Point => ({ x: p.x * size.w, y: p.y * size.h });
  if (gradient.type === "linear") {
    const start = px(handles.start);
    const end = px(handles.end);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    if (length < 1e-9)
      return `linear-gradient(${cssColor(stops[0]!.color)}, ${cssColor(stops[0]!.color)})`;
    const angle = Math.atan2(dx, -dy);
    const ux = dx / length;
    const uy = dy / length;
    // CSS's gradient line runs through the middle, as long as the box is across that way.
    const line = Math.abs(size.w * Math.sin(angle)) + Math.abs(size.h * Math.cos(angle));
    const lineStart = { x: size.w / 2 - (ux * line) / 2, y: size.h / 2 - (uy * line) / 2 };
    const list = stops.map(({ position, color }) => {
      const at = { x: start.x + dx * position, y: start.y + dy * position };
      const along = ((at.x - lineStart.x) * ux + (at.y - lineStart.y) * uy) / line;
      return `${cssColor(color)} ${percent(along)}`;
    });
    return `linear-gradient(${degrees(angle)}deg, ${list.join(", ")})`;
  }
  const center = `at ${percent(handles.start.x)} ${percent(handles.start.y)}`;
  const list = stops.map(({ position, color }) => `${cssColor(color)} ${percent(position)}`);
  if (gradient.type === "angular") {
    const start = px(handles.start);
    const end = px(handles.end);
    const from = degrees(Math.atan2(end.y - start.y, end.x - start.x) + Math.PI / 2);
    return `conic-gradient(from ${from}deg ${center}, ${list.join(", ")})`;
  }
  const rx = screenLength(handles.start, handles.end, size) / Math.max(size.w, 1e-9);
  const ry = screenLength(handles.start, handles.width, size) / Math.max(size.h, 1e-9);
  return `radial-gradient(${percent(rx)} ${percent(ry)} ${center}, ${list.join(", ")})`;
}
