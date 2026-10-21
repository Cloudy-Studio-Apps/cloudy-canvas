import { measureText, type Point } from "@canvas";

import { INK_COLOR } from "../../palette";
import { createTextDraft } from "./text.factory";
import { TEXT_DEFAULTS } from "./text.defaults";
import type { TextElement } from "./text.types";

/** A text element for text pasted from outside the app, centered on `at`; `null` for blank text. */
export function createPastedText(text: string, at: Point, index: string): TextElement | null {
  const clean = text.replace(/\r\n?/g, "\n").trim();
  if (!clean) return null;
  const draft = createTextDraft(at, INK_COLOR, TEXT_DEFAULTS.fontSize);
  const size = measureText(clean, draft.fontSize);
  const x = Math.round(at.x - size.w / 2);
  const y = Math.round(at.y - size.h / 2);
  return { ...draft, index, x, y, text: clean, ...size };
}
