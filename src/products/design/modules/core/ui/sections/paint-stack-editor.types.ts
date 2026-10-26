import type { ReactNode } from "react";

import type { Size } from "@canvas";
import type { ColorChangeInfo } from "@canvas-ui";
import type { Paint } from "../../node/paint.types";

/** Where each paint's variables go after a change (`null`: the stack was replaced). */
export type PaintStackMap = ((index: number) => number | null) | null;

export interface PaintStackEditorProps {
  paints: readonly Paint[];
  /** The targets' stacks differ: "+" replaces them all. */
  mixed: boolean;
  /** One paint's name, e.g. "Fill". */
  label: string;
  allowImage: boolean;
  /**
   * Changes the stack; `map` says where each paint's variables go (unset: they stay). `info` is
   * a drag's step (`done: false`) or its end.
   */
  onChange: (
    change: (current: readonly Paint[]) => Paint[],
    info?: ColorChangeInfo,
    map?: PaintStackMap,
  ) => void;
  /** Where the paints' colors are bound: `fills`, `strokes`, or a style's `paints`. */
  bindPrefix: string;
  /** The layers' field, so a gradient's handles show on the canvas (layers only). */
  handlesField?: "fills" | "strokes";
  /** The edited layer's size (one layer), for copying a gradient as CSS. */
  size?: Size;
  /** Shown under the paints (the stroke weight). */
  children?: ReactNode;
}
