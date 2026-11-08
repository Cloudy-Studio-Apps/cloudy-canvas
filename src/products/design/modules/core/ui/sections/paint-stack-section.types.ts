import type { ReactNode } from "react";

import type { Size } from "@canvas";
import type { Paint } from "../../node/paint.types";
import type { PaintStackMap } from "./paint-stack-editor.types";

export interface PaintStackSectionProps {
  title: string;
  /** Each target's paint stack (a layer's fills, a vector area's, …); they differ: mixed. */
  stacks: readonly (readonly Paint[])[];
  /**
   * Changes every target's stack. `checkpoint` is false for a drag's later steps, which join the
   * undo step of its first; `map` says where each paint's variables go (unset: they stay).
   */
  onChange: (
    change: (current: readonly Paint[]) => Paint[],
    checkpoint: boolean,
    map?: PaintStackMap,
  ) => void;
  /** The paint "+" adds. */
  newPaint: () => Paint;
  allowImage: boolean;
  /** Controls before "+" in the header (a style control, "Use layer fill"). */
  actions?: ReactNode;
  /** Leaves "+" out (while a style stands for the paints). */
  hideAdd?: boolean;
  /** Shown instead of the paints (an applied style's chip). */
  replacement?: ReactNode;
  /** A line under the title (which areas are edited). */
  note?: ReactNode;
  /** Where the paints' colors are bound (`fills`, `strokes`); unset: they can't be bound. */
  bindPrefix?: string;
  /** The layers' field, so a gradient's handles show on the canvas (layers only). */
  handlesField?: "fills" | "strokes";
  /** With `handlesField`, the vector area whose fills these are. */
  handlesRegion?: number;
  /** The edited layer's size (one layer), for copying a gradient as CSS. */
  size?: Size;
  /** Shown under the paints (e.g. the stroke weight). */
  children?: ReactNode;
}
