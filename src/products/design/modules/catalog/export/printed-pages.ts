import { brochurePageSize, spanOf, type BookLayout, type BrochurePage } from "../model";
import type { PrintedPage } from "./printed-pages.types";

/**
 * The PDF's pages: the layout's sides in order, a blank page for each blank side, and spread
 * frames as their two halves (`split`) or one wide page.
 */
export function printedPages(
  pages: readonly BrochurePage[],
  layout: BookLayout,
  split: boolean,
): PrintedPage[] {
  const size = brochurePageSize(pages) ?? { w: 0, h: 0 };
  return layout.sides.flatMap((side): PrintedPage[] => {
    if (side.kind === "blank") return [{ kind: "blank", size }];
    const { frame } = side.page;
    if (side.part !== "whole") {
      // Unsplit, a spread prints once, as its left side comes.
      if (split) return [{ kind: "frame", frame, part: side.part }];
      return side.part === "left" ? [{ kind: "frame", frame, part: "whole" }] : [];
    }
    if (split && spanOf(frame, size) === 2) {
      return [
        { kind: "frame", frame, part: "left" },
        { kind: "frame", frame, part: "right" },
      ];
    }
    return [{ kind: "frame", frame, part: "whole" }];
  });
}
