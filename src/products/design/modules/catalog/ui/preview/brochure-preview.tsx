import { useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { tCommon } from "@shared/core";

import { brochurePageSize } from "../../model/page-span";
import { Button } from "@shared/ui/kit";
import { useBrochure } from "../hooks/use-brochure";
import { useBrochurePreviewStore } from "../stores/preview-store";
import { Preview3dToggle } from "./preview-3d-toggle";
import { PreviewStage } from "./preview-stage";
import { PreviewStrip } from "./preview-strip";
import { usePreviewKeys } from "./use-preview-keys";
import { t } from "../../catalog.i18n";

/**
 * The brochure as a reader flips through it (an `overlays` entry): a spread at a time as the
 * layout reads it (covers alone, facing pages, blank pages added; or single pages), as a 3D
 * booklet whose pages turn or flat (the switch at the top), the arrows and ← → to turn, the strip
 * to jump, Esc to close.
 */
export function BrochurePreview() {
  const spread = useBrochurePreviewStore((state) => state.spread);
  const show = useBrochurePreviewStore((state) => state.show);
  const close = useBrochurePreviewStore((state) => state.close);
  const { pages, settings, layout } = useBrochure();
  const last = layout.spreads.length - 1;
  const current = spread === null ? -1 : Math.min(spread, last);
  const shown = layout.spreads[current] ?? [];
  const turn = useCallback(
    (by: -1 | 1) => show(Math.max(0, Math.min(current + by, last))),
    [show, current, last],
  );
  usePreviewKeys(spread !== null, turn, close);

  const pageSize = brochurePageSize(pages);
  if (spread === null || shown.length === 0 || !pageSize) return null;
  const shownSlots = new Set(
    shown.flatMap((index) => {
      const side = layout.sides[index];
      return side?.kind === "page" ? [side.page.slot.id] : [];
    }),
  );
  const spreadOf = (slotId: string) =>
    layout.spreads.findIndex((indexes) =>
      indexes.some((index) => {
        const side = layout.sides[index];
        return side?.kind === "page" && side.page.slot.id === slotId;
      }),
    );

  return (
    <div
      role="dialog"
      aria-label={t("preview.label")}
      className="pointer-events-auto fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-overlay backdrop-blur-sm"
    >
      <header className="absolute inset-x-4 top-4 flex items-center justify-between">
        <Preview3dToggle />
        <Button size="sm" variant="secondary" onClick={close}>
          <X />
          {tCommon("close")}
        </Button>
      </header>
      <PreviewStage
        layout={layout}
        single={settings.layout === "single"}
        current={current}
        pageSize={pageSize}
      />
      <div className="flex items-center gap-3 text-sm text-surface">
        <Button
          size="icon"
          variant="secondary"
          aria-label={t("preview.previous")}
          disabled={current === 0}
          onClick={() => turn(-1)}
        >
          <ChevronLeft />
        </Button>
        <span className="tabular-nums">
          {layout.spreadNumbers[current]} / {layout.pageCount}
        </span>
        <Button
          size="icon"
          variant="secondary"
          aria-label={t("preview.next")}
          disabled={current === last}
          onClick={() => turn(1)}
        >
          <ChevronRight />
        </Button>
      </div>
      <PreviewStrip
        pages={pages}
        shown={shownSlots}
        onPick={(slotId) => show(Math.max(0, spreadOf(slotId)))}
      />
    </div>
  );
}
