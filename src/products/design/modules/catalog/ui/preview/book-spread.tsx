import { sideWidth } from "../../model/page-span";
import type { BookSide } from "../../model/book-layout.types";
import { BookPage } from "./book-page";
import type { BookSpreadProps } from "./preview.types";
import { TurningSheet } from "./turning-sheet";

/** How far the eye is from the booklet, in CSS pixels (closer: stronger perspective). */
const PERSPECTIVE = 2600;
/** How far the booklet leans back, as if it lay on a desk. */
const TILT_DEGREES = 16;

/**
 * The spread as a booklet lying open in 3D (the preview's default): tilted back with a shadow
 * under it, page edges and the spine's shade; mid-turn, the turning page above it. In the single
 * layout each page lies alone in the middle, as wide as it is (a spread frame whole).
 */
export function BookSpread({ view, single, size, pageSize, turnId }: BookSpreadProps) {
  const { base, sheet } = view;
  const { scale, page, stageWidth } = size;
  // The single layout centers each side by its own width.
  const centered = (side: BookSide | null) => {
    const width = sideWidth(side, pageSize) * scale;
    return { left: (stageWidth - width) / 2, width };
  };
  const sheetBox = !sheet
    ? null
    : single
      ? centered(sheet.front)
      : { left: sheet.over === "right" ? page.width : 0, width: page.width };

  return (
    <div style={{ perspective: PERSPECTIVE }}>
      <div
        className="relative transform-3d"
        style={{ width: stageWidth, height: page.height, transform: `rotateX(${TILT_DEGREES}deg)` }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-[4%] -bottom-8 h-12 rounded-[50%] bg-foreground/40 blur-2xl"
        />
        {single ? (
          <BookPage
            side={base.right}
            position="single"
            height={page.height}
            {...centered(base.right)}
          />
        ) : (
          <>
            <BookPage
              side={base.left}
              position="left"
              left={0}
              width={page.width}
              height={page.height}
            />
            <BookPage
              side={base.right}
              position="right"
              left={page.width}
              width={page.width}
              height={page.height}
            />
          </>
        )}
        {sheet && sheetBox && (
          <TurningSheet key={turnId} sheet={sheet} height={page.height} {...sheetBox} />
        )}
      </div>
    </div>
  );
}
