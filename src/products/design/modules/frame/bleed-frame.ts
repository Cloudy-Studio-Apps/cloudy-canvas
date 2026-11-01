import { multiplyAffine, type GradientTransform } from "@canvas";

import type { Paint } from "../core";
import type { FrameElement } from "./frame.types";

/**
 * A frame as a print page draws it, `by` larger on every side, so its fills and its clip reach the
 * bleed. What it holds stays put; gradients and cropped pictures stay put too, because their
 * transforms read the frame's box. Pictures that fit or cover the box follow its new size.
 */
export function bleedFrame(frame: FrameElement, by: number): FrameElement {
  const { x, y, w, h } = frame;
  const toOldBox: GradientTransform = [
    [(w + by * 2) / w, 0, -by / w],
    [0, (h + by * 2) / h, -by / h],
  ];
  const held = (paint: Paint): Paint =>
    paint.type !== "solid" && paint.transform
      ? { ...paint, transform: multiplyAffine(paint.transform, toOldBox) }
      : paint;
  return {
    ...frame,
    x: x - by,
    y: y - by,
    w: w + by * 2,
    h: h + by * 2,
    fills: frame.fills.map(held),
  };
}
