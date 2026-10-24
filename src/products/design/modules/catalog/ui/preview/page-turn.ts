import type { BookLayout, BookSlots, PageTurn } from "./preview.types";

/** How long a page takes to turn, in milliseconds. */
export const TURN_MS = 700;
/** Slow at both ends, like a page lifted, turned and laid down. */
export const TURN_EASING = "cubic-bezier(0.45, 0.05, 0.3, 1)";

/**
 * Where a spread's pages lie in an open booklet: with facing pages the cover on the right, pairs
 * across the spine and a last page alone on the left; without, the one page.
 */
export function bookSlots(spread: readonly number[], facing: boolean): BookSlots {
  const [first = null, second = null] = spread;
  if (!facing) return { left: null, right: first };
  if (first === 0) return { left: null, right: 0 };
  return { left: first, right: second };
}

/** The booklet at rest on a spread. */
export function restingBook(spread: readonly number[], facing: boolean): BookLayout {
  return { base: bookSlots(spread, facing), sheet: null };
}

/**
 * The booklet mid-turn. With facing pages, going forward the right page turns over the spine
 * (showing the next spread's left page on its back) above the old left and the new right page;
 * going back, the left page turns the other way. Without, the page turns away to the left going
 * forward, and the previous one turns back in going back.
 */
export function turningBook(
  turn: PageTurn,
  spreads: readonly (readonly number[])[],
  facing: boolean,
): BookLayout {
  const from = bookSlots(spreads[turn.from] ?? [], facing);
  const to = bookSlots(spreads[turn.to] ?? [], facing);
  const forward = turn.to > turn.from;
  if (!facing) {
    return forward
      ? {
          base: to,
          sheet: {
            over: "single",
            hinge: "left",
            front: from.right,
            back: null,
            from: 0,
            to: -180,
          },
        }
      : {
          base: from,
          sheet: { over: "single", hinge: "left", front: to.right, back: null, from: -180, to: 0 },
        };
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
