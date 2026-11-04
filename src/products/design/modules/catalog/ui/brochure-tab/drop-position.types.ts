/**
 * What a page dragged in the Brochure tab is dropped on: a page's row, a blank page the layout
 * added, a spread's heading (the indexes of its first side), or the space after the last row.
 */
export type ListDropTarget =
  | { kind: "page"; slotId: string }
  | { kind: "blank"; side: number }
  | { kind: "spread"; first: number }
  | { kind: "end" };
