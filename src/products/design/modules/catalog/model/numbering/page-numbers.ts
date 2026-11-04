import type { BrochureElement, PageNumberStyle } from "../../brochure";
import type { BookLayout } from "../book-layout.types";
import type { PageInfo } from "./page-numbers.types";
import { toRoman } from "./roman";

function written(n: number, style: PageNumberStyle): string {
  if (style === "arabic") return String(n);
  return toRoman(n, style === "roman-lower");
}

/**
 * Each printed side's number, section and side of the spine (indexed like `layout.sides`): the
 * numbers count from `settings.numbering.start`, covers as `numbering.covers` says, blank pages
 * counted but unwritten; a section restarts or restyles them from its first side on.
 */
export function pageNumbers(layout: BookLayout, record: BrochureElement): PageInfo[] {
  const { numbering, layout: kind, covers } = record.settings;
  const sectionAt = new Map(record.sections.map((section) => [section.start, section]));
  const last = layout.sides.length - 1;
  const front = kind === "book" && (covers === "both" || covers === "front");
  const back = kind === "book" && last > 0 && (covers === "both" || covers === "back");
  let counter = numbering.start;
  let style = numbering.style;
  let section: PageInfo["section"] = null;

  return layout.sides.map((side, i) => {
    if (side.kind === "page" && side.part !== "right") {
      const starts = sectionAt.get(side.page.slot.id);
      if (starts) {
        section = starts;
        if (starts.restart !== undefined) counter = starts.restart;
        if (starts.style) style = starts.style;
      }
    }
    const cover = (i === 0 && front) || (i === last && back);
    const parity = kind === "single" || (i + layout.offset) % 2 === 1 ? "right" : "left";
    if (cover && numbering.covers === "uncounted") {
      return { counted: false, number: null, label: "", section, parity, cover };
    }
    const number = counter++;
    const hidden = side.kind === "blank" || (cover && numbering.covers === "hidden");
    return {
      counted: true,
      number,
      label: hidden ? "" : written(number, style),
      section,
      parity,
      cover,
    };
  });
}
