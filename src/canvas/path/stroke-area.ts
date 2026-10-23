import { booleanPaths } from "./boolean-paths";
import { dashPath } from "./dash-path";
import { outlineStroke } from "./outline-stroke";
import type { PathShape, StrokeAreaOptions } from "./path.types";

const EMPTY: PathShape = { contours: [] };

/**
 * The area a stroke covers, as a normalized shape: `outlineStroke` of the (dashed) contours, laid
 * as `align` says. Inside and outside strokes are twice as wide and cut by the area the closed
 * contours enclose, so they sit exactly within or around the shape (holes included); open
 * contours have no inside, so they're always centered.
 */
export function strokeArea(
  shape: PathShape,
  { align = "center", dashes = [], dashOffset = 0, ...outline }: StrokeAreaOptions,
): PathShape {
  if (outline.width <= 0 || shape.contours.length === 0) return EMPTY;
  const dashed = (part: PathShape) => dashPath(part, dashes, dashOffset);
  if (align === "center") return outlineStroke(dashed(shape), outline);

  const closed: PathShape = { contours: shape.contours.filter((contour) => contour.closed) };
  const open: PathShape = { contours: shape.contours.filter((contour) => !contour.closed) };
  const parts: PathShape[] = [];
  if (closed.contours.length > 0) {
    const ring = outlineStroke(dashed(closed), { ...outline, width: outline.width * 2 });
    const inside = { shape: closed, fillRule: "evenodd" } as const;
    parts.push(
      booleanPaths(align === "inside" ? "intersect" : "subtract", [
        { shape: ring, fillRule: "evenodd" },
        inside,
      ]),
    );
  }
  if (open.contours.length > 0) parts.push(outlineStroke(dashed(open), outline));
  if (parts.length === 1) return parts[0]!;
  return booleanPaths(
    "union",
    parts.map((part) => ({ shape: part, fillRule: "evenodd" })),
  );
}
