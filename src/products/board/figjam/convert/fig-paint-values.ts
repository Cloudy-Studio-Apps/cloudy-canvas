import { hexBytes, hexOf, type FigPaint } from "@canvas/figma";

/** The color of the first visible solid paint (`#rrggbb`), or `null` when there's none. */
export function solidColor(paints: readonly FigPaint[] | undefined): string | null {
  const paint = paints?.find(
    (p) => p.type === "SOLID" && p.visible !== false && (p.opacity ?? 1) > 0,
  );
  return paint ? hexOf(paint.color) : null;
}

/** The hash (hex) of the topmost visible image paint, as its file is named, or `null`. */
export function imageHash(paints: readonly FigPaint[] | undefined): string | null {
  const paint = [...(paints ?? [])]
    .reverse()
    .find((p) => p.type === "IMAGE" && p.visible !== false);
  const hash = paint?.image?.hash;
  return hash ? hexBytes(hash) : null;
}
