import type { BrochurePage } from "./brochure-pages.types";

/** Which part of a page's frame a side shows: all of it, or a half of a spread frame. */
export type SidePart = "whole" | "left" | "right";

/** Why a blank page was added: so the back cover ends on the left, or a spread starts on one. */
export type BlankReason = "back-cover" | "spread-start";

/** One printed page of the brochure, in order. */
export type BookSide =
  | { kind: "page"; page: BrochurePage; part: SidePart }
  | { kind: "blank"; reason: BlankReason; /** The page it comes before. */ before: string };

/** The brochure as it prints and is read. */
export interface BookLayout {
  /** Every printed page in order: pages, spread frames' halves, blanks added. */
  sides: BookSide[];
  /** The sides seen together (indexes into `sides`): pairs across the spine, or one at a time. */
  spreads: number[][];
  /** Each slot's page numbers ("1", "6–7"), counting the blanks and spreads. */
  labels: Map<string, string>;
  /** Each spread's printed page numbers ("1", "2–3"). */
  spreadNumbers: string[];
  /** How many pages it prints (blanks added, a spread frame's two pages counted). */
  pageCount: number;
  /**
   * In the book layout, side `i` lies on the left of the spine when `(i + offset)` is even: 1 with a
   * front cover (alone on the right), else 0.
   */
  offset: 0 | 1;
}
