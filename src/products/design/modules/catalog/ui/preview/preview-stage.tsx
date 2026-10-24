import { useMemo } from "react";

import { useCatalogViewStore } from "../stores/catalog-view-store";
import { BookSpread } from "./book-spread";
import { FlatSpread } from "./flat-spread";
import { restingBook, turningBook } from "./page-turn";
import type { PreviewStageProps } from "./preview.types";
import { bookPageSize, flatPageWidth } from "./preview-size";
import { usePageTurn } from "./use-page-turn";
import { usePrefetchPages } from "./use-prefetch-pages";

/**
 * The spread shown: as a 3D booklet whose pages turn (the default), or flat with 3D off. The
 * pages of the spreads around it are drawn ahead.
 */
export function PreviewStage({ pages, spreads, current, facing }: PreviewStageProps) {
  const threeD = useCatalogViewStore((state) => state.preview3d);
  const turn = usePageTurn(current, threeD);
  const frameAt = (position: number | null) =>
    position === null ? undefined : pages[position]?.frame;
  const frames = (spreads[current] ?? []).map(frameAt).filter((frame) => frame !== undefined);
  const sample = pages[0]?.frame;
  const size = sample ? bookPageSize(sample, facing ? 2 : 1) : { width: 0, height: 0 };
  const around = useMemo(
    () =>
      [current - 1, current + 1]
        .flatMap((spread) => spreads[spread] ?? [])
        .map((position) => pages[position]?.frame)
        .filter((frame) => frame !== undefined),
    [pages, spreads, current],
  );
  usePrefetchPages(threeD ? around : [], size);

  if (!threeD || !sample) return <FlatSpread frames={frames} width={flatPageWidth(frames)} />;
  const layout = turn
    ? turningBook(turn, spreads, facing)
    : restingBook(spreads[current] ?? [], facing);
  return (
    <BookSpread
      layout={layout}
      single={!facing}
      frameAt={frameAt}
      width={size.width}
      height={size.height}
      turnId={turn?.id ?? null}
    />
  );
}
