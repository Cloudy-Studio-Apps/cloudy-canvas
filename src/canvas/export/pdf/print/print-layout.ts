import type { Rect } from "../../../geometry.types";
import type { PdfBox, PdfPageLayout } from "../pdf-writer.types";
import type { PdfPrintBoxes } from "./pdf-print.types";

/** The room between the bleed and a crop mark, in points: 1 mm. */
const MARK_GAP = 2.83;
/** A crop mark's length, in points: 5 mm. */
const MARK_LENGTH = 14.17;

/** `rect` with `by` more on every side. */
export function outsetRect({ x, y, w, h }: Rect, by: number): Rect {
  return { x: x - by, y: y - by, w: w + by * 2, h: h + by * 2 };
}

/** A page going to press: `rect` is the trim, with the bleed and the marks' band round it. */
export function printPageLayout(
  rect: Rect,
  { bleed, marks }: PdfPrintBoxes,
  scale: number,
): PdfPageLayout {
  const bled = bleed * scale;
  const space = bled + (marks ? MARK_GAP + MARK_LENGTH : 0);
  const width = rect.w * scale + space * 2;
  const height = rect.h * scale + space * 2;
  const box = (inset: number): PdfBox => {
    return [inset, inset, width - inset, height - inset];
  };
  return {
    width,
    height,
    scale,
    left: space,
    top: height - space,
    boxes: { trim: box(space), bleed: box(space - bled) },
  };
}

/** The operators keeping a page's content inside its bleed, clear of the marks. */
export function bleedClipOps({ boxes }: PdfPageLayout): string {
  if (!boxes) return "";
  const [left, bottom, right, top] = boxes.bleed;
  return `${left} ${bottom} ${right - left} ${top - bottom} re W n`;
}

/** The crop marks: two lines at each corner, on the trim, starting clear of the bleed. */
export function cropMarkOps({ boxes }: PdfPageLayout, color: string): string {
  if (!boxes) return "";
  const [left, bottom, right, top] = boxes.trim;
  const off = left - boxes.bleed[0] + MARK_GAP;
  const lines = [
    [left, bottom, 0, -1],
    [left, bottom, -1, 0],
    [right, bottom, 0, -1],
    [right, bottom, 1, 0],
    [left, top, 0, 1],
    [left, top, -1, 0],
    [right, top, 0, 1],
    [right, top, 1, 0],
  ] as const;
  const paths = lines.map(([x, y, dx, dy]) => {
    const start = `${x + dx * off} ${y + dy * off} m`;
    return `${start} ${x + dx * (off + MARK_LENGTH)} ${y + dy * (off + MARK_LENGTH)} l S`;
  });
  return ["q", "0.25 w", color, ...paths, "Q"].join("\n");
}
