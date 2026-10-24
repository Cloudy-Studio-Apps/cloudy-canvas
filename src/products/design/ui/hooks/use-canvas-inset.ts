import { useMemo } from "react";

import { useUiHidden } from "@canvas-ui";
import { canvasInset } from "../design-layout";
import type { CanvasInset } from "../design-layout.types";
import { useDesignPanelStore } from "../stores/design-panel-store";

/** Where the canvas sits now, as the panels are open or closed and the UI shown or hidden. */
export function useCanvasInset(): CanvasInset {
  const leftOpen = useDesignPanelStore((state) => state.leftOpen);
  const rightOpen = useDesignPanelStore((state) => state.rightOpen);
  const hidden = useUiHidden();
  return useMemo(() => canvasInset({ leftOpen, rightOpen, hidden }), [leftOpen, rightOpen, hidden]);
}
