import { dtcgColor, joinTokenColor, type DtcgStyleCodec } from "@canvas";

import { PAINT_STYLE, readPaintStyle } from "../../core";

/** Color styles of one solid paint as a DTCG `color` (others travel in Cloudy's extension). */
export const PAINT_STYLE_CODEC: DtcgStyleCodec = {
  styleType: PAINT_STYLE,
  dtcgType: "color",
  group: "Colors",
  write(style, ref) {
    const { paints = [] } = readPaintStyle(style.value) ?? {};
    const paint = paints[0];
    if (paints.length !== 1 || paint?.type !== "solid") return null;
    const bound = style.bindings?.["paints.0.color"];
    return (bound ? ref(bound) : null) ?? dtcgColor(joinTokenColor(paint.color, paint.opacity));
  },
};
