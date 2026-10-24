import { useEffect, useMemo, useReducer } from "react";

import {
  CATALOG_PICK_TOOL,
  CATALOG_TOOL,
  isPageFrame,
  mmToUnits,
  type FrameElement,
} from "@design";
import { useDesignEngine, useDesignState } from "@design/ui/design-engine-context";
import { useBrochure } from "../hooks/use-brochure";
import { useCatalogSelection } from "../hooks/use-catalog-selection";
import { useHoveredFrame } from "../hooks/use-hovered-frame";
import { optionLetter } from "../option-letter";
import { useCatalogViewStore } from "../stores/catalog-view-store";
import { AddFrameBar } from "./add-frame-bar";
import { MarginGuide } from "./margin-guide";
import { PageBadge } from "./page-badge";
import { PickBanner } from "./pick-banner";
import { PickCheckbox } from "./pick-checkbox";

/** No frames to hover (the same list each time, so the hover hook doesn't start again). */
const NO_FRAMES: readonly FrameElement[] = [];
/** Frames drawn smaller than this on screen (px) get no badge or buttons. */
const MIN_SCREEN_SIZE = 48;

/**
 * What the Catalog mode draws over the canvas, following the view: each page's number on its
 * frame (and its options' 9A, 9B, …), the margins when they're shown, "+ Page / + Option" on the
 * greyed frame under the pointer, and while picking, a tick on every frame and the banner.
 */
export function BrochureCanvasLayer() {
  const engine = useDesignEngine();
  const { pages, settings, version, label: labelOf } = useBrochure();
  const scope = useDesignState((state) => state.scope);
  const tool = useDesignState((state) => state.tool);
  const selectedIds = useDesignState((state) => state.selectedIds);
  const selection = useCatalogSelection();
  const margins = useCatalogViewStore((state) => state.margins);
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  useEffect(() => engine.onViewChange(redraw), [engine]);

  // The page frames on the design page on screen.
  const frames = useMemo(
    () => engine.elements().filter(isPageFrame),
    // The version and scope re-read them when the document or the page changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engine, version, scope],
  );
  const hovered = useHoveredFrame(tool === CATALOG_TOOL ? frames : NO_FRAMES);
  const picking = tool === CATALOG_PICK_TOOL;
  const ticked = new Set(selectedIds);
  const target = selection.kind === "page" ? selection.page : pages.at(-1);
  const inset = mmToUnits(settings.margin);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {frames.map((frame) => {
        const rect = engine.worldRectToScreen(frame);
        if (Math.max(rect.w, rect.h) < MIN_SCREEN_SIZE) return null;
        if (picking)
          return <PickCheckbox key={frame.id} rect={rect} ticked={ticked.has(frame.id)} />;
        const page = pages.find((item) => item.options.some((option) => option.id === frame.id));
        if (!page) {
          return frame.id === hovered ? (
            <AddFrameBar key={frame.id} rect={rect} frame={frame} target={target} />
          ) : null;
        }
        const printed = page.frame.id === frame.id;
        const option = page.options.findIndex((item) => item.id === frame.id);
        const label =
          page.options.length > 1 ? `${labelOf(page)}${optionLetter(option)}` : labelOf(page);
        const safe = {
          x: frame.x + inset,
          y: frame.y + inset,
          w: frame.w - inset * 2,
          h: frame.h - inset * 2,
        };
        return (
          <span key={frame.id}>
            {margins && printed && <MarginGuide rect={engine.worldRectToScreen(safe)} />}
            <PageBadge rect={rect} label={label} printed={printed} />
          </span>
        );
      })}
      {picking && <PickBanner />}
    </div>
  );
}
