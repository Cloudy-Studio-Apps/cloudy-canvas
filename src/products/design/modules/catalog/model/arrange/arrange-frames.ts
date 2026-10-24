import { roundPoint, type Point } from "@canvas";

import type { FrameElement } from "../../../frame";
import type { BrochurePage } from "../brochure-pages.types";
import { ARRANGE_GAPS } from "./arrange.constants";
import type { ArrangeBlock, ArrangeMode } from "./arrange.types";

const HALF_SPINE = ARRANGE_GAPS.spine / 2;

/**
 * Where every frame of the brochure goes (its new top-left), from `origin` (the layout's top-left
 * corner). `below`: the blocks left to right, the printed pages on one row at the spine, each
 * page's other options stacked under it. `beside`: a block per row top to bottom on one shared
 * spine, a left page's options out to the left, the others' out to the right. Lanes are as wide
 * (or tall) as their widest frame, so frames of different sizes never overlap.
 */
export function arrangeFrames(
  blocks: readonly ArrangeBlock[],
  mode: ArrangeMode,
  origin: Point,
): Map<string, Point> {
  const at = new Map<string, Point>();
  const place = (frame: FrameElement, x: number, y: number) =>
    at.set(frame.id, roundPoint({ x, y }));
  if (mode === "below") arrangeBelow(blocks, origin, place);
  else arrangeBeside(blocks, origin, place);
  return at;
}

type Place = (frame: FrameElement, x: number, y: number) => void;

function arrangeBelow(blocks: readonly ArrangeBlock[], origin: Point, place: Place): void {
  let x = origin.x;
  for (const { left, right, across } of blocks) {
    const half = widest(across) / 2;
    const leftSide = Math.max(left ? widest(left) + HALF_SPINE : 0, half);
    const rightSide = Math.max(right ? widest(right) + HALF_SPINE : 0, half);
    const spine = x + leftSide;
    if (left) column(left, (w) => spine - HALF_SPINE - w, origin.y, place);
    if (right) column(right, () => spine + HALF_SPINE, origin.y, place);
    if (across) column(across, (w) => spine - w / 2, origin.y, place);
    x += leftSide + rightSide + ARRANGE_GAPS.spread;
  }
}

/** A page's printed frame at `y`, then its other options under it, each placed by `xOf(width)`. */
function column(page: BrochurePage, xOf: (w: number) => number, y: number, place: Place): void {
  let top = y;
  for (const frame of printedFirst(page)) {
    place(frame, xOf(frame.w), top);
    top += frame.h + ARRANGE_GAPS.option;
  }
}

function arrangeBeside(blocks: readonly ArrangeBlock[], origin: Point, place: Place): void {
  const spine = origin.x + Math.max(0, ...blocks.map(leftLane));
  let y = origin.y;
  for (const { left, right, across } of blocks) {
    if (left) row(left, spine - HALF_SPINE - left.frame.w, -1, y, place);
    if (right) row(right, spine + HALF_SPINE, 1, y, place);
    if (across) row(across, spine - across.frame.w / 2, 1, y, place);
    const frames = [left, right, across].flatMap((page) => page?.options ?? []);
    y += Math.max(0, ...frames.map((frame) => frame.h)) + ARRANGE_GAPS.spread;
  }
}

/** A page's printed frame at `x`, then its other options out to one side (`-1` left, `1` right). */
function row(page: BrochurePage, x: number, direction: -1 | 1, y: number, place: Place): void {
  place(page.frame, x, y);
  let edge = direction < 0 ? x : x + page.frame.w;
  for (const frame of others(page)) {
    const left = direction < 0 ? edge - ARRANGE_GAPS.option - frame.w : edge + ARRANGE_GAPS.option;
    place(frame, left, y);
    edge = direction < 0 ? left : left + frame.w;
  }
}

/** How far a block reaches left of the spine in the `beside` layout. */
function leftLane({ left, across }: ArrangeBlock): number {
  const fromLeft = left
    ? HALF_SPINE + others(left).reduce((sum, f) => sum + f.w + ARRANGE_GAPS.option, left.frame.w)
    : 0;
  return Math.max(fromLeft, across ? across.frame.w / 2 : 0);
}

function widest(page: BrochurePage | undefined): number {
  return Math.max(0, ...(page?.options ?? []).map((frame) => frame.w));
}

function printedFirst(page: BrochurePage): FrameElement[] {
  return [page.frame, ...others(page)];
}

/** A page's options other than the printed one, in the slot's order. */
function others(page: BrochurePage): FrameElement[] {
  return page.options.filter((frame) => frame.id !== page.frame.id);
}
