import { useMemo } from "react";

import type { BookSide } from "../../model/book-layout.types";
import type { FrameElement } from "../../../frame";
import { useCatalogViewStore } from "../stores/catalog-view-store";
import { BookSpread } from "./book-spread";
import { FlatSpread } from "./flat-spread";
import { restingBook, turningBook } from "./page-turn";
import type { PreviewStageProps } from "./preview.types";
import { stageSize } from "./preview-size";
import { usePageTurn } from "./use-page-turn";
import { usePrefetchPages } from "./use-prefetch-pages";

/** Nothing to draw ahead (the same list each time, so the prefetch doesn't run again). */
const NO_FRAMES: readonly FrameElement[] = [];

/**
 * The spread shown: as a 3D booklet whose pages turn (the default), or flat with 3D off. The
 * pages of the spreads around it are drawn ahead.
 */
export function PreviewStage({ layout, single, current, pageSize }: PreviewStageProps) {
  const threeD = useCatalogViewStore((state) => state.preview3d);
  const turn = usePageTurn(current, threeD);
  const sidesOf = (spread: number) =>
    (layout.spreads[spread] ?? [])
      .map((index) => layout.sides[index])
      .filter((side): side is BookSide => side !== undefined);
  const size = stageSize(pageSize, layout.sides, single);
  const around = useMemo(
    () => [
      ...new Set(
        [current - 1, current + 1]
          .flatMap((spread) => (layout.spreads[spread] ?? []).map((index) => layout.sides[index]))
          .flatMap((side) => (side?.kind === "page" ? [side.page.frame] : [])),
      ),
    ],
    [layout, current],
  );
  usePrefetchPages(threeD ? around : NO_FRAMES, size.scale);

  if (!threeD) return <FlatSpread sides={sidesOf(current)} pageSize={pageSize} />;
  const view = turn ? turningBook(turn, layout, single) : restingBook(layout, current, single);
  return (
    <BookSpread
      view={view}
      single={single}
      size={size}
      pageSize={pageSize}
      turnId={turn?.id ?? null}
    />
  );
}
