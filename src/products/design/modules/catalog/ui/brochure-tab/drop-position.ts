import type { RowDropSide } from "@canvas-ui";
import type { BookLayout } from "../../model/book-layout.types";
import type { BrochurePage } from "../../model/brochure-pages.types";
import type { ListDropTarget } from "./drop-position.types";
import { isBackCover } from "../../model/is-back-cover";

const PREFIX = { page: "page:", blank: "blank:", spread: "spread:", section: "section:" } as const;
const END = "end";

/** The row-drag id of a drop target in the Brochure tab's list. */
export function dropId(target: ListDropTarget): string {
  switch (target.kind) {
    case "page":
      return PREFIX.page + target.slotId;
    case "blank":
      return PREFIX.blank + target.side;
    case "spread":
      return PREFIX.spread + target.first;
    case "section":
      return PREFIX.section + target.id;
    case "end":
      return END;
  }
}

/** The drop target a row-drag id names, `null` for none. */
export function parseDropId(id: string): ListDropTarget | null {
  if (id === END) return { kind: "end" };
  if (id.startsWith(PREFIX.section))
    return { kind: "section", id: id.slice(PREFIX.section.length) };
  if (id.startsWith(PREFIX.page)) return { kind: "page", slotId: id.slice(PREFIX.page.length) };
  const index = (prefix: string) => {
    const n = Number(id.slice(prefix.length));
    return Number.isInteger(n) && n >= 0 ? n : null;
  };
  if (id.startsWith(PREFIX.blank)) {
    const side = index(PREFIX.blank);
    return side === null ? null : { kind: "blank", side };
  }
  if (id.startsWith(PREFIX.spread)) {
    const first = index(PREFIX.spread);
    return first === null ? null : { kind: "spread", first };
  }
  return null;
}

/**
 * Where (0-based, among the other pages, for `DesignBrochure.moveMany`) the pages `dragged` go
 * when dropped on `target`: on a page, before or after it; on a blank page, in the blank's place
 * (before the page the blank comes before); on a spread's heading, as that spread's first pages,
 * or as the back cover on the back cover's heading; after the last row, last. `null` when the
 * target is gone.
 */
export function dropPosition(
  layout: BookLayout,
  pages: readonly BrochurePage[],
  dragged: readonly string[],
  target: ListDropTarget,
  side: RowDropSide,
): number | null {
  const moving = new Set(dragged);
  const others = pages.filter((page) => !moving.has(page.slot.id));
  // Before the first page left at or after `slotId` (one being dragged leaves its place).
  const before = (slotId: string) => {
    const from = pages.findIndex((page) => page.slot.id === slotId);
    if (from < 0) return null;
    const next = pages.slice(from).find((page) => !moving.has(page.slot.id));
    return next ? others.indexOf(next) : others.length;
  };

  switch (target.kind) {
    case "page": {
      const over = others.findIndex((page) => page.slot.id === target.slotId);
      return over < 0 ? null : over + (side === "after" ? 1 : 0);
    }
    case "blank": {
      const blank = layout.sides[target.side];
      return blank?.kind === "blank" ? before(blank.before) : null;
    }
    case "spread": {
      const spread = layout.spreads.find((sides) => sides[0] === target.first);
      if (!spread) return null;
      if (isBackCover(layout, spread)) return others.length;
      const first = spread.map((index) => layout.sides[index]).find((sideAt) => sideAt);
      if (!first) return null;
      return before(first.kind === "page" ? first.page.slot.id : first.before);
    }
    // The list turns a folder into a drop after its last page first.
    case "section":
      return null;
    case "end":
      return others.length;
  }
}

/**
 * Whether dropping `dragged` on `target` means "this page isn't the back cover": the back cover
 * dropped on the blank page added before it (so it ends on the left). Moving pages never removes
 * that blank, as the count stays the same; leaving the back cover out of the covers does.
 */
export function dropsBackCover(
  layout: BookLayout,
  dragged: readonly string[],
  target: ListDropTarget,
): boolean {
  if (target.kind !== "blank" || dragged.length !== 1) return false;
  const blank = layout.sides[target.side];
  return blank?.kind === "blank" && blank.reason === "back-cover" && blank.before === dragged[0];
}
