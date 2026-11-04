import { rowDropIndex } from "@canvas-ui";
import type { RowDropSide } from "@canvas-ui";
import type { BookLayout } from "../../model/book-layout.types";
import type { BrochurePage } from "../../model/brochure-pages.types";
import type { ListDropTarget } from "./drop-position.types";
import { isBackCover } from "../../model/is-back-cover";

const PREFIX = { page: "page:", blank: "blank:", spread: "spread:" } as const;
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
    case "end":
      return END;
  }
}

/** The drop target a row-drag id names, `null` for none. */
export function parseDropId(id: string): ListDropTarget | null {
  if (id === END) return { kind: "end" };
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
 * Where (0-based, for `DesignBrochure.move`) the page `dragged` goes when dropped on `target`:
 * on a page, before or after it; on a blank page, in the blank's place (before the page the blank
 * comes before); on a spread's heading, as that spread's first page, or as the back cover on the
 * back cover's heading; after the last row, last. Returns its current position when it can't tell.
 */
export function dropPosition(
  layout: BookLayout,
  pages: readonly BrochurePage[],
  dragged: string,
  target: ListDropTarget,
  side: RowDropSide,
): number {
  const indexOf = (slotId: string) => pages.findIndex((page) => page.slot.id === slotId);
  const from = indexOf(dragged);
  const before = (slotId: string) => {
    const over = indexOf(slotId);
    return over < 0 ? from : rowDropIndex(from, over, "before");
  };

  switch (target.kind) {
    case "page": {
      const over = indexOf(target.slotId);
      return over < 0 ? from : rowDropIndex(from, over, side);
    }
    case "blank": {
      const blank = layout.sides[target.side];
      return blank?.kind === "blank" ? before(blank.before) : from;
    }
    case "spread": {
      const spread = layout.spreads.find((sides) => sides[0] === target.first);
      if (!spread) return from;
      if (isBackCover(layout, spread)) return pages.length - 1;
      for (const index of spread) {
        const sideAt = layout.sides[index];
        if (sideAt?.kind === "page") return before(sideAt.page.slot.id);
        if (sideAt?.kind === "blank") return before(sideAt.before);
      }
      return from;
    }
    case "end":
      return pages.length - 1;
  }
}
