import type { VariantRequest } from "@canvas";

/** The chooser of the tab's pending variant request, as the bar shows it. */
export interface VariantChooser {
  request: VariantRequest;
  /** The listed ids still in the document, in order. */
  present: string[];
  /** Into `present`. */
  index: number;
  /** The variants' page is on screen. */
  onPage: boolean;
  note: string;
  setNote(note: string): void;
  previous(): void;
  next(): void;
  compareAll(): void;
  backToPage(): void;
  keepThis(): void;
  keepAll(): void;
  close(): void;
}
