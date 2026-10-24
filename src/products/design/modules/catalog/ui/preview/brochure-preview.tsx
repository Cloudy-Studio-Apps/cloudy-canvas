import { useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { brochureSpreads } from "@design";
import { Button } from "@shared/ui/components/ui/button";
import { useBrochure } from "../hooks/use-brochure";
import { useBrochurePreviewStore } from "../stores/preview-store";
import { Preview3dToggle } from "./preview-3d-toggle";
import { PreviewStage } from "./preview-stage";
import { PreviewStrip } from "./preview-strip";
import { usePreviewKeys } from "./use-preview-keys";

/**
 * The brochure as a reader flips through it (an `overlays` entry): a spread at a time, as a 3D
 * booklet whose pages turn or flat (the switch at the top), the arrows and ← → to turn, the strip
 * to jump, Esc to close.
 */
export function BrochurePreview() {
  const spread = useBrochurePreviewStore((state) => state.spread);
  const show = useBrochurePreviewStore((state) => state.show);
  const close = useBrochurePreviewStore((state) => state.close);
  const { pages, settings } = useBrochure();
  const spreads = brochureSpreads(pages.length, settings.facing);
  const current = spread === null ? -1 : Math.min(spread, spreads.length - 1);
  const shown = spreads[current] ?? [];
  const last = spreads.length - 1;
  const turn = useCallback(
    (by: -1 | 1) => show(Math.max(0, Math.min(current + by, last))),
    [show, current, last],
  );
  usePreviewKeys(spread !== null, turn, close);

  if (spread === null || shown.length === 0) return null;
  return (
    <div
      role="dialog"
      aria-label="Brochure preview"
      className="pointer-events-auto fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-overlay backdrop-blur-sm"
    >
      <header className="absolute inset-x-4 top-4 flex items-center justify-between">
        <Preview3dToggle />
        <Button size="sm" variant="secondary" onClick={close}>
          <X />
          Close
        </Button>
      </header>
      <PreviewStage pages={pages} spreads={spreads} current={current} facing={settings.facing} />
      <div className="flex items-center gap-3 text-sm text-surface">
        <Button
          size="icon"
          variant="secondary"
          aria-label="Previous"
          disabled={current === 0}
          onClick={() => turn(-1)}
        >
          <ChevronLeft />
        </Button>
        <span className="tabular-nums">
          {shown.map((position) => position + 1).join("–")} / {pages.length}
        </span>
        <Button
          size="icon"
          variant="secondary"
          aria-label="Next"
          disabled={current === last}
          onClick={() => turn(1)}
        >
          <ChevronRight />
        </Button>
      </div>
      <PreviewStrip
        pages={pages}
        shown={shown}
        onPick={(position) => show(spreads.findIndex((item) => item.includes(position)))}
      />
    </div>
  );
}
