import type { LayerDragState, LayerListMetrics } from "./layer-drop.types";

export interface DropIndicatorProps {
  drag: LayerDragState;
  metrics: LayerListMetrics;
}
