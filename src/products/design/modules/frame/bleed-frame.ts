import { multiplyAffine, type GradientTransform } from "@canvas";

import type { Paint } from "../core";
import type { FrameElement } from "./frame.types";

/**
 * A frame as a print page draws it, `by` larger on every side, so its fills and its clip reach the
 * bleed. What it holds stays put; gradients and cropped pictures stay put too, because their
 * transforms read the frame's box. Pictures that fit or cover the box follow its new size. Its
 * strokes run in from the bleed, ending where they ended on the page. A frame with rounded corners
 * has no bleed to give: it's drawn as it is (the checks say so).
 */
export function bleedFrame(frame: FrameElement, by: number): FrameElement {
  if (frame.cornerRadius > 0) return frame;
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
    ...bledStrokes(frame, by),
  };
}

/** Strokes inside the grown frame that reach as far into the page as they did. */
function bledStrokes(
  { strokes, strokeAlign, strokeWeight, strokeWeights }: FrameElement,
  by: number,
): Partial<FrameElement> {
  if (strokes.length === 0) return {};
  const onPage = { inside: 1, center: 0.5, outside: 0 }[strokeAlign];
  const grown = (weight: number) => by + weight * onPage;
  return {
    strokeAlign: "inside",
    strokeWeight: grown(strokeWeight),
    ...(strokeWeights
      ? {
          strokeWeights: {
            top: grown(strokeWeights.top),
            right: grown(strokeWeights.right),
            bottom: grown(strokeWeights.bottom),
            left: grown(strokeWeights.left),
          },
        }
      : {}),
  };
}
