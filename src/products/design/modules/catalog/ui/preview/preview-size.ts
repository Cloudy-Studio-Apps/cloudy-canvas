import type { FrameElement } from "@design";
import type { PreviewSize } from "./preview.types";

/** How much of the window the shown spread may take. */
const FILL_WIDTH = 0.86;
const FILL_HEIGHT = 0.68;

/** The width each page of a flat spread gets, so the spread fits the window. */
export function flatPageWidth(frames: readonly FrameElement[]): number {
  return Math.min(
    (window.innerWidth * FILL_WIDTH) / Math.max(1, frames.length),
    ...frames.map((frame) => (window.innerHeight * FILL_HEIGHT * frame.w) / frame.h),
  );
}

/**
 * The size of each page of the 3D booklet (`slots` side by side), shaped like `sample` (the first
 * page), so the booklet keeps its size as it's turned.
 */
export function bookPageSize(sample: FrameElement, slots: number): PreviewSize {
  const aspect = sample.w / sample.h;
  const width = Math.min(
    (window.innerWidth * FILL_WIDTH) / slots,
    window.innerHeight * FILL_HEIGHT * aspect,
  );
  return { width, height: width / aspect };
}

/** The pixels a page picture needs a side to look sharp at this size on this screen. */
export function pictureSide({ width, height }: PreviewSize): number {
  return Math.round(Math.max(width, height) * window.devicePixelRatio);
}
