import type { PrintedPage } from "./printed-pages.types";

/**
 * Each layout side's PDF page (its 0-based index): the first printed page that shows it, so a
 * spread printed whole is one page for both its sides; -1 for a side no page shows.
 */
export function sidePdfPages(printed: readonly PrintedPage[], sideCount: number): number[] {
  const pages = new Array<number>(sideCount).fill(-1);
  printed.forEach((page, index) => {
    for (const side of page.sides) if (pages[side] === -1) pages[side] = index;
  });
  return pages;
}
