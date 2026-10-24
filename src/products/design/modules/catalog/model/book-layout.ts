import type { BrochureSettings } from "../brochure";
import type { BookLayout, BookSide } from "./book-layout.types";
import type { BrochurePage } from "./brochure-pages.types";
import { brochurePageSize, spanOf } from "./page-span";

/**
 * How the brochure prints and is read. In the book layout pages face each other across a spine:
 * with a front cover the first page is alone on the right, spread frames give two facing pages
 * and start on a left page (a blank goes before one that wouldn't), and with a back cover the
 * last page ends alone on the left (after a blank when it wouldn't). In the single layout each
 * page is seen on its own, spread frames whole.
 */
export function bookLayout(
  pages: readonly BrochurePage[],
  settings: Pick<BrochureSettings, "layout" | "covers">,
): BookLayout {
  const size = brochurePageSize(pages);
  const span = (page: BrochurePage) => (size ? spanOf(page.frame, size) : 1);
  return settings.layout === "single" ? singleLayout(pages, span) : bookOf(pages, settings, span);
}

function singleLayout(
  pages: readonly BrochurePage[],
  span: (page: BrochurePage) => 1 | 2,
): BookLayout {
  const sides: BookSide[] = pages.map((page) => ({ kind: "page", page, part: "whole" }));
  const labels = new Map<string, string>();
  let number = 1;
  for (const page of pages) {
    labels.set(page.slot.id, numbers(number, span(page)));
    number += span(page);
  }
  const spreadNumbers = pages.map((page) => labels.get(page.slot.id) ?? "");
  return {
    sides,
    spreads: sides.map((_, i) => [i]),
    labels,
    spreadNumbers,
    pageCount: number - 1,
    offset: 0,
  };
}

function bookOf(
  pages: readonly BrochurePage[],
  { covers }: Pick<BrochureSettings, "covers">,
  span: (page: BrochurePage) => 1 | 2,
): BookLayout {
  const front = covers === "both" || covers === "front";
  const back = covers === "both" || covers === "back";
  const offset: 0 | 1 = front ? 1 : 0;
  // A side is a left page when its position (counted from the spine's first spread) is even.
  const onLeft = (position: number) => (position + offset) % 2 === 0;
  const sides: BookSide[] = [];
  const labels = new Map<string, string>();

  pages.forEach((page, i) => {
    const wide = span(page) === 2;
    const last = i === pages.length - 1 && pages.length > 1;
    if (wide && !onLeft(sides.length)) {
      sides.push({ kind: "blank", reason: "spread-start", before: page.slot.id });
    } else if (back && last && !wide && !onLeft(sides.length)) {
      sides.push({ kind: "blank", reason: "back-cover", before: page.slot.id });
    }
    labels.set(page.slot.id, numbers(sides.length + 1, wide ? 2 : 1));
    if (wide)
      sides.push({ kind: "page", page, part: "left" }, { kind: "page", page, part: "right" });
    else sides.push({ kind: "page", page, part: "whole" });
  });

  const spreads: number[][] = [];
  sides.forEach((_, i) => {
    const spread = Math.floor((i + offset) / 2);
    (spreads[spread] ??= []).push(i);
  });
  const read = spreads.filter((spread) => spread.length > 0);
  return {
    sides,
    spreads: read,
    labels,
    spreadNumbers: read.map((spread) => spread.map((index) => index + 1).join("–")),
    pageCount: sides.length,
    offset,
  };
}

/** "4", or "6–7" for a spread frame. */
function numbers(first: number, count: 1 | 2): string {
  return count === 2 ? `${first}–${first + 1}` : String(first);
}
