import type { Rect } from "@canvas";

import { axisItems, clampSize, shareRoom } from "./axis-items";
import type { AxisItem, LayoutFrameInput, LayoutItem, LayoutResult } from "./layout-frame.types";

/**
 * Lays an auto layout frame's layers out, as Figma does: one after another along its direction
 * with its gap (or spread, `space-between`), aligned across it, inside its padding; layers that
 * fill share the room the others leave (within their limits) or stretch across; a frame that
 * hugs takes the size of its layers. With `wrap`, layers that don't fit go on to new lines,
 * `counterGap` apart. Pure: positions are from the frame's corner, unturned.
 */
export function layoutFrame(frame: LayoutFrameInput, items: readonly LayoutItem[]): LayoutResult {
  const { layout } = frame;
  const horizontal = layout.direction === "horizontal";
  const { top, right, bottom, left } = layout.padding;
  const [padP, padPEnd, padC, padCEnd] = horizontal
    ? [left, right, top, bottom]
    : [top, bottom, left, right];
  const hugP = horizontal ? frame.hugW : frame.hugH;
  const hugC = horizontal ? frame.hugH : frame.hugW;
  const all = axisItems(items, horizontal);
  // A frame that hugs along its direction leaves no room to fill.
  if (hugP) for (const a of all) a.fillP = false;

  const sizeP0 = horizontal ? frame.w : frame.h;
  const innerP = sizeP0 - padP - padPEnd;
  const lines = layout.wrap && !hugP ? wrapLines(all, innerP, layout.gap) : [all];
  if (lines.length > 1) for (const a of all) a.fillP = false;

  // Sizes along the direction: fill items share what the others leave.
  for (const line of lines) {
    const fill = line.filter((a) => a.fillP);
    if (fill.length === 0) continue;
    const fixed = line.filter((a) => !a.fillP).reduce((sum, a) => sum + a.p, 0);
    const room = innerP - fixed - layout.gap * (line.length - 1);
    for (const [a, size] of shareRoom(fill, room)) a.p = size;
  }
  const lengths = lines.map((line) => lineLength(line, layout.gap));
  const sizeP = hugP
    ? clampFrame(Math.max(0, ...lengths) + padP + padPEnd, frame, horizontal ? "W" : "H")
    : sizeP0;

  // Sizes across: each line is as thick as its thickest layer that doesn't fill.
  const baselineAlign = layout.counterAlign === "baseline" && horizontal;
  const thick = lines.map((line) => lineThickness(line, baselineAlign));
  const sizeC0 = horizontal ? frame.h : frame.w;
  const content = thick.reduce((sum, t) => sum + t, 0) + layout.counterGap * (lines.length - 1);
  const sizeC = hugC ? clampFrame(content + padC + padCEnd, frame, horizontal ? "H" : "W") : sizeC0;
  const innerC = sizeC - padC - padCEnd;
  if (lines.length === 1 && thick[0] !== undefined) thick[0] = innerC;
  for (const [i, line] of lines.entries()) {
    for (const a of line) if (a.fillC) a.c = clampSize(thick[i] ?? a.c, a.minC, a.maxC);
  }

  const placed = new Map<string, Rect>();
  const blockC = lines.length === 1 ? innerC : content;
  let c = padC + alignOffset(layout.counterAlign, innerC - blockC);
  for (const [i, line] of lines.entries()) {
    const t = thick[i] ?? 0;
    placeLine(line, sizeP - padP - padPEnd, t, layout, baselineAlign, (a, p, cOffset) => {
      const rect = horizontal
        ? { x: padP + p, y: c + cOffset, w: a.p, h: a.c }
        : { x: c + cOffset, y: padP + p, w: a.c, h: a.p };
      placed.set(a.item.id, rect);
    });
    c += t + layout.counterGap;
  }
  return horizontal ? { w: sizeP, h: sizeC, items: placed } : { w: sizeC, h: sizeP, items: placed };
}

/** Places one line's items along it, each aligned across the line's thickness `t`. */
function placeLine(
  line: readonly AxisItem[],
  inner: number,
  t: number,
  layout: LayoutFrameInput["layout"],
  baselineAlign: boolean,
  place: (a: AxisItem, p: number, c: number) => void,
): void {
  const length = lineLength(line, layout.gap);
  const spread = layout.align === "space-between" && line.length > 1;
  const sum = line.reduce((total, a) => total + a.p, 0);
  const gap = spread ? (inner - sum) / (line.length - 1) : layout.gap;
  let p = spread ? 0 : alignOffset(layout.align, inner - length);
  const top = baselineAlign ? Math.max(...line.map(baselineOf)) : 0;
  for (const a of line) {
    const c = baselineAlign ? top - baselineOf(a) : alignOffset(layout.counterAlign, t - a.c);
    place(a, p, c);
    p += a.p + gap;
  }
}

/** Splits items into lines no longer than `inner` (each line holds one item at least). */
function wrapLines(all: AxisItem[], inner: number, gap: number): AxisItem[][] {
  const lines: AxisItem[][] = [];
  let line: AxisItem[] = [];
  let length = 0;
  for (const a of all) {
    if (line.length > 0 && length + gap + a.p > inner + 0.01) {
      lines.push(line);
      line = [];
      length = 0;
    }
    length += (line.length > 0 ? gap : 0) + a.p;
    line.push(a);
  }
  if (line.length > 0) lines.push(line);
  return lines;
}

function lineLength(line: readonly AxisItem[], gap: number): number {
  if (line.length === 0) return 0;
  return line.reduce((sum, a) => sum + a.p, 0) + gap * (line.length - 1);
}

/** The thickest layer that doesn't fill across (or the thickest, when all do). */
function lineThickness(line: readonly AxisItem[], baselineAlign: boolean): number {
  const sized = line.filter((a) => !a.fillC);
  const counted = sized.length > 0 ? sized : line;
  if (!baselineAlign) return Math.max(0, ...counted.map((a) => a.c));
  const top = Math.max(0, ...counted.map(baselineOf));
  return Math.max(0, ...counted.map((a) => top - baselineOf(a) + a.c));
}

function baselineOf(a: AxisItem): number {
  return a.item.baseline ?? a.c;
}

function alignOffset(align: string, free: number): number {
  if (align === "center") return free / 2;
  if (align === "end") return free;
  return 0;
}

function clampFrame(n: number, frame: LayoutFrameInput, axis: "W" | "H"): number {
  return clampSize(n, frame.limits?.[`min${axis}`] ?? 0, frame.limits?.[`max${axis}`] ?? Infinity);
}
