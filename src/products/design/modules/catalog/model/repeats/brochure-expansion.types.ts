import type { DataPhase, DataSourceElement } from "../../../data";
import type { BrochureElement } from "../../brochure";
import type { BrochureExpansion } from "./expand-brochure.types";

/** A brochure's last expansion and what it was read from (`brochureExpansion` reuses it). */
export interface ExpansionMemo {
  /** The record read (the document hands out a new object when it changes). */
  record: BrochureElement;
  phase: DataPhase;
  /** The sources read, in order (each a new object when it changes). */
  sources: readonly DataSourceElement[];
  /** Which of their snapshots this device holds (one arriving in a live session changes it). */
  held: string;
  expansion: BrochureExpansion;
}
