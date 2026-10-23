import type { Rect } from "@canvas";

import type { AutoLayout, SizeLimits } from "../core";

/** An auto layout frame as `layoutFrame` lays it out: its layout, size and what hugs. */
export interface LayoutFrameInput {
  layout: AutoLayout;
  w: number;
  h: number;
  /** Whether its width (`hugW`) or height grows and shrinks to what it holds. */
  hugW: boolean;
  hugH: boolean;
  limits: SizeLimits | null;
}

/** One layer an auto layout places: the box it takes (its turned bounds) and how it sizes. */
export interface LayoutItem {
  id: string;
  w: number;
  h: number;
  /** Whether it takes the room its frame leaves along each axis. */
  fillW: boolean;
  fillH: boolean;
  limits: SizeLimits | null;
  /** Its first baseline from its top (`null`: its bottom). */
  baseline: number | null;
}

/** Where `layoutFrame` puts each layer (from the frame's corner) and the frame's own size. */
export interface LayoutResult {
  w: number;
  h: number;
  items: Map<string, Rect>;
}

/** An item seen along the layout's direction (`p`) and across it (`c`). */
export interface AxisItem {
  item: LayoutItem;
  p: number;
  c: number;
  fillP: boolean;
  fillC: boolean;
  minP: number;
  maxP: number;
  minC: number;
  maxC: number;
}
