import { BookPage } from "./book-page";
import type { BookSpreadProps } from "./preview.types";
import { TurningSheet } from "./turning-sheet";

/** How far the eye is from the booklet, in CSS pixels (closer: stronger perspective). */
const PERSPECTIVE = 2600;
/** How far the booklet leans back, as if it lay on a desk. */
const TILT_DEGREES = 16;

/**
 * The spread as a booklet lying open in 3D (the preview's default): tilted back with a shadow
 * under it, page edges and the spine's shade; mid-turn, the turning page above it.
 */
export function BookSpread({ layout, single, frameAt, width, height, turnId }: BookSpreadProps) {
  const { base, sheet } = layout;
  return (
    <div style={{ perspective: PERSPECTIVE }}>
      <div
        className="relative transform-3d"
        style={{
          width: single ? width : width * 2,
          height,
          transform: `rotateX(${TILT_DEGREES}deg)`,
        }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-[4%] -bottom-8 h-12 rounded-[50%] bg-foreground/40 blur-2xl"
        />
        {single ? (
          <BookPage frame={frameAt(base.right)} side="single" width={width} height={height} />
        ) : (
          <>
            <BookPage frame={frameAt(base.left)} side="left" width={width} height={height} />
            <BookPage frame={frameAt(base.right)} side="right" width={width} height={height} />
          </>
        )}
        {sheet && (
          <TurningSheet
            key={turnId}
            sheet={sheet}
            front={frameAt(sheet.front)}
            back={frameAt(sheet.back)}
            width={width}
            height={height}
          />
        )}
      </div>
    </div>
  );
}
