import type { BookLayout } from "@design";
import type { BookSlots, BookView, PageTurn } from "./preview.types";

/** How long a page takes to turn, in milliseconds. */
export const TURN_MS = 700;
/** Slow at both ends, like a page lifted, turned and laid down. */
export const TURN_EASING = "cubic-bezier(0.45, 0.05, 0.3, 1)";

/**
 * Where a spread's sides lie in the open booklet: each on the side of the spine the layout puts
 * it (`BookLayout.offset`); in the single layout, the one side.
 */
export function bookSlots(layout: BookLayout, spread: number, single: boolean): BookSlots {
  const indexes = layout.spreads[spread] ?? [];
  const slots: BookSlots = { left: null, right: null };
  for (const index of indexes) {
    const side = layout.sides[index] ?? null;
    if (single || (index + layout.offset) % 2 !== 0) slots.right = side;
    else slots.left = side;
  }
  return slots;
}

/** The booklet at rest on a spread. */
export function restingBook(layout: BookLayout, spread: number, single: boolean): BookView {
  return { base: bookSlots(layout, spread, single), sheet: null };
}

/**
 * The booklet mid-turn. In the book layout, going forward the right side turns over the spine
 * (showing the next spread's left side on its back) above the old left and the new right side;
 * going back, the left side turns the other way. In the single layout the page turns away to the
 * left going forward, and the previous one turns back in going back.
 */
export function turningBook(turn: PageTurn, layout: BookLayout, single: boolean): BookView {
  const from = bookSlots(layout, turn.from, single);
  const to = bookSlots(layout, turn.to, single);
  const forward = turn.to > turn.from;
  if (single) {
    const sheet = { over: "single", hinge: "left", back: null } as const;
    return forward
      ? { base: to, sheet: { ...sheet, front: from.right, from: 0, to: -180 } }
      : { base: from, sheet: { ...sheet, front: to.right, from: -180, to: 0 } };
  }
  return forward
    ? {
        base: { left: from.left, right: to.right },
        sheet: {
          over: "right",
          hinge: "left",
          front: from.right,
          back: to.left,
          from: 0,
          to: -180,
        },
      }
    : {
        base: { left: to.left, right: from.right },
        sheet: { over: "left", hinge: "right", front: from.left, back: to.right, from: 0, to: 180 },
      };
}
