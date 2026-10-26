import type { DtcgStyleCodec } from "@canvas";

import { EFFECT_STYLE_CODEC } from "./effect-style-codec";
import { PAINT_STYLE_CODEC } from "./paint-style-codec";
import { TEXT_STYLE_CODEC } from "./text-style-codec";

/** How the design's styles read and write as DTCG composite tokens. */
export const DESIGN_STYLE_CODECS: readonly DtcgStyleCodec[] = [
  TEXT_STYLE_CODEC,
  EFFECT_STYLE_CODEC,
  PAINT_STYLE_CODEC,
];
