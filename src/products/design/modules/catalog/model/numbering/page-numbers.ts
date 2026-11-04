import type { BrochureElement, BrochureSection, PageNumberStyle } from "../../brochure";
import type { BookLayout } from "../book-layout.types";
import type { PageInfo } from "./page-numbers.types";
import { toRoman } from "./roman";
import { placeSections } from "../sections/place-sections";
import type { PlacedSection } from "../sections/sections.types";

function written(n: number, style: PageNumberStyle): string {
  if (style === "arabic") return String(n);
  return toRoman(n, style === "roman-lower");
}

/**
 * Each printed side's number, section and side of the spine (indexed like `layout.sides`): the
 * numbers count from `settings.numbering.start`, covers as `numbering.covers` says, blank pages
 * counted but unwritten; a section restarts or restyles them from its first side on. A side is in
 * the sections starting on or before it (`placeSections`): its `path`, outermost first.
 */
export function pageNumbers(layout: BookLayout, record: BrochureElement): PageInfo[] {
  const { numbering, layout: kind, covers } = record.settings;
  const startingAt = new Map<string, PlacedSection[]>();
  for (const placed of placeSections(record.sections, record.slots)) {
    startingAt.set(placed.section.start, [...(startingAt.get(placed.section.start) ?? []), placed]);
  }
  const last = layout.sides.length - 1;
  const front = kind === "book" && (covers === "both" || covers === "front");
  const back = kind === "book" && last > 0 && (covers === "both" || covers === "back");
  let counter = numbering.start;
  let style = numbering.style;
  let path: BrochureSection[] = [];

  return layout.sides.map((side, i) => {
    if (side.kind === "page" && side.part !== "right") {
      const starting = startingAt.get(side.page.slot.id);
      if (starting) path = [...path];
      for (const { section, depth } of starting ?? []) {
        path.length = depth;
        path.push(section);
        if (section.restart !== undefined) counter = section.restart;
        if (section.style) style = section.style;
      }
    }
    const cover = (i === 0 && front) || (i === last && back);
    const section = path.at(-1) ?? null;
    const parity = kind === "single" || (i + layout.offset) % 2 === 1 ? "right" : "left";
    if (cover && numbering.covers === "uncounted") {
      return { counted: false, number: null, label: "", section, path, parity, cover };
    }
    const number = counter++;
    const hidden = side.kind === "blank" || (cover && numbering.covers === "hidden");
    return {
      counted: true,
      number,
      label: hidden ? "" : written(number, style),
      section,
      path,
      parity,
      cover,
    };
  });
}
