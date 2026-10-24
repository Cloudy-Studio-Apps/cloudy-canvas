import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { brochureSpreads } from "@design";
import { Button } from "@shared/ui/components/ui/button";
import { cn } from "@shared/ui/lib/utils";
import { PageThumbnail } from "../brochure-tab/page-thumbnail";
import { useBrochure } from "../hooks/use-brochure";
import { useBrochurePreviewStore } from "../stores/preview-store";
import { PreviewPage } from "./preview-page";

/** How much of the window the shown spread may take. */
const FILL_WIDTH = 0.86;
const FILL_HEIGHT = 0.68;

/**
 * The brochure as a reader flips through it (an `overlays` entry): a spread at a time (pages side
 * by side with facing pages), the arrows and ← → to turn, the strip to jump, Esc to close.
 */
export function BrochurePreview() {
  const spread = useBrochurePreviewStore((state) => state.spread);
  const show = useBrochurePreviewStore((state) => state.show);
  const close = useBrochurePreviewStore((state) => state.close);
  const { pages, settings } = useBrochure();
  const spreads = brochureSpreads(pages.length, settings.facing);
  const current = spread === null ? -1 : Math.min(spread, spreads.length - 1);
  const shown = spreads[current] ?? [];

  useEffect(() => {
    if (spread === null) return;
    const turn = (to: number) => show(Math.max(0, Math.min(to, spreads.length - 1)));
    const onKey = (event: KeyboardEvent) => {
      const handled: Record<string, () => void> = {
        Escape: close,
        ArrowLeft: () => turn(current - 1),
        ArrowRight: () => turn(current + 1),
      };
      const run = handled[event.key];
      if (!run) return;
      // The canvas's shortcuts wait while the preview is open.
      event.preventDefault();
      event.stopPropagation();
      run();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [spread, current, spreads.length, show, close]);

  if (spread === null || shown.length === 0) return null;
  const frames = shown
    .map((position) => pages[position]?.frame)
    .filter((frame) => frame !== undefined);
  const width = Math.min(
    (window.innerWidth * FILL_WIDTH) / frames.length,
    Math.min(...frames.map((frame) => (window.innerHeight * FILL_HEIGHT * frame.w) / frame.h)),
  );

  return (
    <div
      role="dialog"
      aria-label="Brochure preview"
      className="pointer-events-auto fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-overlay backdrop-blur-sm"
    >
      <Button size="sm" variant="secondary" className="absolute top-4 right-4" onClick={close}>
        <X />
        Close
      </Button>
      <div className="flex gap-0.5 shadow-lifted">
        {frames.map((frame) => (
          <PreviewPage key={frame.id} frame={frame} width={width} />
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm text-surface">
        <Button
          size="icon"
          variant="secondary"
          aria-label="Previous"
          disabled={current === 0}
          onClick={() => show(current - 1)}
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
          disabled={current === spreads.length - 1}
          onClick={() => show(current + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="flex max-w-[90vw] gap-1 overflow-x-auto p-1">
        {pages.map((page, position) => (
          <button
            key={page.slot.id}
            type="button"
            aria-label={`Page ${page.number}`}
            onClick={() => show(spreads.findIndex((item) => item.includes(position)))}
            className={cn(
              "shrink-0 cursor-pointer opacity-50 outline-2 outline-transparent hover:opacity-80",
              shown.includes(position) && "opacity-100 outline-ring",
            )}
          >
            <PageThumbnail frameId={page.frame.id} className="h-10 w-14" />
          </button>
        ))}
      </div>
    </div>
  );
}
