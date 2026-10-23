import type { LayerTree } from "@design";

import type { LayerRowItem } from "./visible-rows.types";

export interface LayersListProps {
  rows: readonly LayerRowItem[];
  tree: LayerTree;
  selected: ReadonlySet<string>;
  /** Layers a mask masks directly → the mask (`siblingMasks`). */
  masked: ReadonlyMap<string, string>;
  onToggle: (id: string) => void;
  onExpand: (id: string) => void;
  /** Whether rows can be dragged (not while searching). */
  draggable: boolean;
}
