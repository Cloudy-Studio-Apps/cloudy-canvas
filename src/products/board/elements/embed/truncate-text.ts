import { measureText } from "@canvas";

const ELLIPSIS = "…";

/** `text` on one line, cut with an ellipsis to fit `maxWidth` (world units) at `fontSize`. */
export function truncateText(text: string, fontSize: number, maxWidth: number): string {
  const line = text.replace(/\s+/g, " ").trim();
  if (measureText(line, fontSize).w <= maxWidth) return line;
  let low = 0;
  let high = line.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (measureText(line.slice(0, mid).trimEnd() + ELLIPSIS, fontSize).w <= maxWidth) low = mid;
    else high = mid - 1;
  }
  return line.slice(0, low).trimEnd() + ELLIPSIS;
}
