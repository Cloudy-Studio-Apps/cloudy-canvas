import type { PointerEvent } from "react";

import type { LayerListMetrics } from "./drag/layer-drop.types";
import type { LayerRowItem } from "./visible-rows.types";

export interface LayerRowProps {
  item: LayerRowItem;
  /** Row height and indents (`useLayerMetrics`). */
  metrics: LayerListMetrics;
  /** Where it's placed in the list (px from the top). */
  top: number;
  selected: boolean;
  /** Masked by a mask under it (`siblingMasks`). */
  masked: boolean;
  /** Dragged layers would drop into it: outlined. */
  dropInside: boolean;
  /** Being dragged: dimmed. */
  dragged: boolean;
  onToggle: (id: string) => void;
  /** Click: selects it (`adds`: Shift or Ctrl/Cmd adds it to the selection). */
  onSelect: (id: string, adds: boolean) => void;
  /** Press: may start dragging it. */
  onPress: (event: PointerEvent<HTMLElement>, item: LayerRowItem) => void;
}
