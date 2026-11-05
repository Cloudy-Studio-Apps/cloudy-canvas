import type { DataScope, ScopeLayer } from "../../../data";
import type { BrochureSlot } from "../../brochure";
import type { PlacedSection } from "../sections";

/** A brochure's template pages as nested loops: sections holding their pages and subsections. */
export type RepeatNode = RepeatSectionNode | RepeatSlotNode;

export interface RepeatSectionNode {
  kind: "section";
  placed: PlacedSection;
  /** Its pages and subsections, in reading order. */
  children: RepeatNode[];
}

export interface RepeatSlotNode {
  kind: "slot";
  slot: BrochureSlot;
}

/** Where the expansion is: the loops around and what the pages inside read. */
export interface ExpandContext {
  scope: DataScope;
  layers: readonly ScopeLayer[];
  path: readonly string[];
  made: boolean;
  printed: boolean;
}

/** One pass of a loop: a row, or a page's rows. */
export interface LoopUnit {
  key: string;
  value: unknown;
  index: number;
}

/** Who a loop belongs to, what it's called in the In scope view and the rows on each pass. */
export interface LoopOwner {
  /** The repeating section's or slot's id. */
  id: string;
  label: string;
  /** Rows on each pass: 1 for a section. */
  perPage: number;
}
