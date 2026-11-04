import type { BookLayout } from "../book-layout.types";
import type { PageInfo } from "./page-numbers.types";

/** A side's number as the page list shows it: written, counted but hidden, or "–" uncounted. */
function sideLabel(info: PageInfo | undefined): string {
  if (!info) return "";
  if (info.label) return info.label;
  return info.number === null ? "–" : String(info.number);
}

/**
 * Each page's printed numbers (slot id → "iv", "6–7"), as its headers and footers write them:
 * a hidden cover's number shows, so the list still reads in order.
 */
export function printedLabels(
  layout: BookLayout,
  numbers: readonly PageInfo[],
): Map<string, string> {
  const labels = new Map<string, string>();
  layout.sides.forEach((side, i) => {
    if (side.kind !== "page" || side.part === "right") return;
    const first = sideLabel(numbers[i]);
    const label = side.part === "left" ? `${first}–${sideLabel(numbers[i + 1])}` : first;
    if (first) labels.set(side.page.slot.id, label);
  });
  return labels;
}
