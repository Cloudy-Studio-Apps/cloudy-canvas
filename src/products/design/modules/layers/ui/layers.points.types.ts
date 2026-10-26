import type { ComponentType } from "react";

/** A part of the Layers tab under the layer tree, added by another module (the pages' list). */
export interface LayersTabSection {
  id: string;
  /** Position under the tree, lowest first. */
  order: number;
  component: ComponentType;
}
