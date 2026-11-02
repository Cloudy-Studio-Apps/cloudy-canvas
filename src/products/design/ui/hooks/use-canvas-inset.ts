import { useMemo } from "react";

import { useUiHidden } from "@canvas-ui";
import { useIsPhone } from "@shared/ui/hooks/use-is-phone";
import { canvasInset } from "../design-layout";
import type { CanvasInset } from "../design-layout.types";
import { useDesignPanelStore } from "../stores/design-panel-store";

/**
 * Where the canvas sits now, as the panels are open or closed and the UI shown or hidden. On a
 * phone the panels lie over it (there'd be no canvas left beside them), so it keeps its place.
 */
export function useCanvasInset(): CanvasInset {
  const leftOpen = useDesignPanelStore((state) => state.leftOpen);
  const rightOpen = useDesignPanelStore((state) => state.rightOpen);
  const hidden = useUiHidden();
  const phone = useIsPhone();
  return useMemo(
    () =>
      canvasInset({
        leftOpen: leftOpen && !phone,
        rightOpen: rightOpen && !phone,
        hidden,
      }),
    [leftOpen, rightOpen, hidden, phone],
  );
}
