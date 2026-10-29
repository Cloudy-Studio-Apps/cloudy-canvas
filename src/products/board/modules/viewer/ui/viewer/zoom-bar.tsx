import { useSyncExternalStore } from "react";
import { Maximize, Minus, Plus } from "lucide-react";

import { IconButton } from "@shared/ui/kit";
import { t } from "../../viewer.i18n";
import type { ZoomBarProps } from "./zoom-bar.types";

/** The viewer's bottom-left zoom controls: out, the zoom, in, and fit the whole board. */
export function ZoomBar({ engine }: ZoomBarProps) {
  const zoom = useSyncExternalStore(engine.subscribe, () => engine.getState().zoom);
  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 flex items-center gap-1 rounded-lg border bg-surface p-1 shadow-md">
      <IconButton label={t("zoom.out")} size="sm" onClick={() => engine.zoomOut()}>
        <Minus />
      </IconButton>
      <span className="w-12 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
      <IconButton label={t("zoom.in")} size="sm" onClick={() => engine.zoomIn()}>
        <Plus />
      </IconButton>
      <IconButton label={t("zoom.fit")} size="sm" onClick={() => engine.zoomToFit()}>
        <Maximize />
      </IconButton>
    </div>
  );
}
