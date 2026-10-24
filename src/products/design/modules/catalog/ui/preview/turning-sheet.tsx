import { useLayoutEffect, useRef } from "react";

import { TURN_EASING, TURN_MS } from "./page-turn";
import type { TurningSheetProps } from "./preview.types";
import { SheetFace } from "./sheet-face";

/** How dark a face gets halfway through the turn, as it faces away from the light. */
const SHADE = 0.35;

/** A page turning round its hinge over the open booklet, shaded as it passes upright. */
export function TurningSheet({ sheet, left, width, height }: TurningSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const frontShade = useRef<HTMLSpanElement>(null);
  const backShade = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const timing = { duration: TURN_MS, easing: TURN_EASING, fill: "forwards" } as const;
    // Lifted a little above the pages lying open, so they never show through it.
    const turn = (degrees: number) => `translateZ(1px) rotateY(${degrees}deg)`;
    const animations = [
      sheetRef.current?.animate(
        [{ transform: turn(sheet.from) }, { transform: turn(sheet.to) }],
        timing,
      ),
      ...[frontShade.current, backShade.current].map((shade) =>
        shade?.animate([{ opacity: 0 }, { opacity: SHADE }, { opacity: 0 }], timing),
      ),
    ];
    return () => {
      for (const animation of animations) animation?.cancel();
    };
  }, [sheet.from, sheet.to]);

  return (
    <div
      ref={sheetRef}
      className="absolute top-0 transform-3d"
      style={{
        left,
        width,
        height,
        transformOrigin: sheet.hinge === "left" ? "left center" : "right center",
        transform: `translateZ(1px) rotateY(${sheet.from}deg)`,
      }}
    >
      <SheetFace side={sheet.front} width={width} height={height} shadeRef={frontShade} />
      <SheetFace side={sheet.back} width={width} height={height} back shadeRef={backShade} />
    </div>
  );
}
