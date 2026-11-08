import type { PrintedPage } from "./printed-pages.types";

/**
 * Each layout side's PDF page (its 0-based index): the first printed page that shows it, so a
 * spread printed whole is one page for both its sides. A side that doesn't print (a template
 * page with nothing to show) opens the next one that does, so a section starting there still
 * has its bookmark and links; -1 when none after it prints.
 */
export function sidePdfPages(printed: readonly PrintedPage[], sideCount: number): number[] {
  const pages = new Array<number>(sideCount).fill(-1);
  printed.forEach((page, index) => {
    for (const side of page.sides) if (pages[side] === -1) pages[side] = index;
  });
  for (let side = sideCount - 2; side >= 0; side--) {
    if (pages[side] === -1) pages[side] = pages[side + 1] ?? -1;
  }
  return pages;
}
