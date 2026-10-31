import type { Point } from "@canvas";

import type { DropShadowEffect, InnerShadowEffect } from "../effect.types";

/**
 * The SVG filter steps of a shadow's shape: `source` grown by its spread, moved, blurred and
 * colored, named `result`. A blur is Figma's, twice the Gaussian's deviation.
 */
export function shadowSvg(
  e: DropShadowEffect | InnerShadowEffect,
  source: string,
  { x, y }: Point,
  prefix: string,
  result: string,
): string {
  const grown = e.spread === 0 ? source : `${prefix}g`;
  const operator = e.spread > 0 ? "dilate" : "erode";
  const spread =
    e.spread === 0
      ? ""
      : `<feMorphology in="${source}" operator="${operator}" radius="${Math.abs(e.spread)}"` +
        ` result="${grown}"/>`;
  return (
    spread +
    `<feOffset in="${grown}" dx="${x}" dy="${y}" result="${prefix}m"/>` +
    `<feGaussianBlur in="${prefix}m" stdDeviation="${e.blur / 2}" result="${prefix}b"/>` +
    `<feFlood flood-color="${e.color}" flood-opacity="${e.opacity}" result="${prefix}c"/>` +
    `<feComposite in="${prefix}c" in2="${prefix}b" operator="in" result="${result}"/>`
  );
}
