import { RULER_SIZE } from "@canvas";

import { rulerLabel, rulerStep } from "./ruler-step";
import type { RulerView } from "./rulers.types";

const FONT = "9px Inter, system-ui, sans-serif";
const MAJOR_TICK_PX = 8;
const MINOR_TICK_PX = 4;
/** Gap between a labeled tick and its number, in CSS px. */
const LABEL_GAP_PX = 3;

/**
 * Draws one ruler on a 2D canvas already scaled to CSS px: its ticks and numbers, and the
 * selection's extent as a tinted band with its two values. The top ruler runs along x; the left
 * one along y, drawn in a turned frame so the same code serves both.
 */
export function drawRuler(g: CanvasRenderingContext2D, view: RulerView): void {
  const { axis, length, start, zoom, selection, colors } = view;
  g.save();
  if (axis === "y") {
    // Turned a quarter: the ruler's length runs down, its numbers read bottom to top.
    g.translate(0, length);
    g.rotate(-Math.PI / 2);
  }
  const at = (value: number) => {
    const along = (value - start) * zoom;
    return axis === "y" ? length - along : along;
  };
  g.fillStyle = colors.background;
  g.fillRect(0, 0, length, RULER_SIZE);

  if (selection) {
    const [a, b] = [at(selection[0]), at(selection[1])].sort((p, q) => p - q) as [number, number];
    g.globalAlpha = 0.15;
    g.fillStyle = colors.selection;
    g.fillRect(a, 0, Math.max(b - a, 1), RULER_SIZE);
    g.globalAlpha = 1;
  }

  const { major, minor } = rulerStep(zoom);
  const end = start + length / zoom;
  g.strokeStyle = colors.foreground;
  g.fillStyle = colors.foreground;
  g.font = FONT;
  g.textBaseline = "top";
  g.lineWidth = 1;
  g.beginPath();
  for (let value = Math.floor(start / minor) * minor; value <= end; value += minor) {
    const isMajor = Math.abs(value / major - Math.round(value / major)) < 1e-6;
    const x = Math.round(at(value)) + 0.5;
    const tick = isMajor ? MAJOR_TICK_PX : MINOR_TICK_PX;
    g.moveTo(x, RULER_SIZE);
    g.lineTo(x, RULER_SIZE - tick);
    if (isMajor) g.fillText(rulerLabel(value), x + LABEL_GAP_PX, 2);
  }
  g.globalAlpha = 0.5;
  g.stroke();
  g.globalAlpha = 1;

  if (selection) {
    for (const value of selection) drawMark(g, at(value), rulerLabel(value), view);
  }
  g.strokeStyle = colors.border;
  g.beginPath();
  g.moveTo(0, RULER_SIZE - 0.5);
  g.lineTo(length, RULER_SIZE - 0.5);
  g.stroke();
  g.restore();
}

/** One end of the selection: its value on a background that hides the numbers under it. */
function drawMark(
  g: CanvasRenderingContext2D,
  x: number,
  text: string,
  { colors }: RulerView,
): void {
  const w = g.measureText(text).width + LABEL_GAP_PX * 2;
  const left = Math.round(x - w / 2);
  g.fillStyle = colors.background;
  g.fillRect(left, 1, w, RULER_SIZE - MAJOR_TICK_PX - 2);
  g.fillStyle = colors.selection;
  g.fillText(text, left + LABEL_GAP_PX, 2);
  g.fillRect(Math.round(x), RULER_SIZE - MAJOR_TICK_PX, 1, MAJOR_TICK_PX);
}
