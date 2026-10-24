import type { Size } from "@canvas";
import type { BookSide, FrameElement } from "@design";
import type { StageSize } from "./preview.types";

/** How much of the window the shown spread may take. */
const FILL_WIDTH = 0.86;
const FILL_HEIGHT = 0.68;

/** A side's width in world units: its frame, half a spread frame, or a blank page's. */
export function sideWidth(side: BookSide | null, page: Size): number {
  if (!side || side.kind === "blank") return page.w;
  return side.part === "whole" ? side.page.frame.w : side.page.frame.w / 2;
}

/**
 * How big the preview draws so the widest spread fits the window: two pages across the spine in
 * the book layout, the widest page (a whole spread frame) in the single one. It stays the same as
 * pages turn.
 */
export function stageSize(page: Size, sides: readonly BookSide[], single: boolean): StageSize {
  const widest = single
    ? Math.max(page.w, ...sides.map((side) => sideWidth(side, page)))
    : page.w * 2;
  const scale = Math.min(
    (window.innerWidth * FILL_WIDTH) / widest,
    (window.innerHeight * FILL_HEIGHT) / page.h,
  );
  return {
    scale,
    page: { width: page.w * scale, height: page.h * scale },
    stageWidth: widest * scale,
  };
}

/** The scale a flat spread of these sides is drawn at to fit the window. */
export function flatScale(sides: readonly BookSide[], page: Size): number {
  const width = sides.reduce((sum, side) => sum + sideWidth(side, page), 0) || page.w;
  return Math.min(
    (window.innerWidth * FILL_WIDTH) / width,
    (window.innerHeight * FILL_HEIGHT) / page.h,
  );
}

/** The pixels a frame's picture needs a side to look sharp drawn at `scale` on this screen. */
export function pictureSide(frame: FrameElement, scale: number): number {
  return Math.round(Math.max(frame.w, frame.h) * scale * window.devicePixelRatio);
}
