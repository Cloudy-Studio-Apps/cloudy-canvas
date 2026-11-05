import { brochurePageSize, spanOf, type BookLayout, type BrochurePage } from "../model";
import type { PrintedPage } from "./printed-pages.types";

/**
 * The PDF's pages: the layout's sides in order, a blank page for each blank side, and spread
 * frames as their two halves (`split`) or one wide page. Pages that don't print (`notPrinted`)
 * are left out; a pending page (a repeat's copy not made yet) can't print: the export makes
 * every page first, on a scratch copy of the document.
 */
export function printedPages(
  pages: readonly BrochurePage[],
  layout: BookLayout,
  split: boolean,
): PrintedPage[] {
  const size = brochurePageSize(pages) ?? { w: 0, h: 0 };
  return layout.sides.flatMap((side, i): PrintedPage[] => {
    if (side.kind === "blank") return [{ kind: "blank", size, sides: [i] }];
    if (side.page.pending) throw new Error("Pending pages must be made before printing.");
    if (side.page.notPrinted) return [];
    const { frame } = side.page;
    if (side.part !== "whole") {
      // Unsplit, a spread prints once, as its left side comes, and shows its right side too.
      if (split) return [{ kind: "frame", frame, part: side.part, sides: [i] }];
      if (side.part === "right") return [];
      const next = layout.sides[i + 1];
      const right = next?.kind === "page" && next.page.frame.id === frame.id ? [i + 1] : [];
      return [{ kind: "frame", frame, part: "whole", sides: [i, ...right] }];
    }
    if (split && spanOf(frame, size) === 2) {
      return [
        { kind: "frame", frame, part: "left", sides: [i] },
        { kind: "frame", frame, part: "right", sides: [i] },
      ];
    }
    return [{ kind: "frame", frame, part: "whole", sides: [i] }];
  });
}
