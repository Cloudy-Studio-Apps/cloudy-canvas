/**
 * Where moved layers land: in `parentId`'s children (`null`: the top of the page), at `position`
 * counted topmost first among the children that aren't moving (0: on top), as the layers panel
 * lists them.
 */
export interface LayerDestination {
  parentId: string | null;
  position: number;
}

/** Where a layer goes relative to another: just above or below it, or on top inside it. */
export type LayerPlace = "above" | "below" | "inside";
