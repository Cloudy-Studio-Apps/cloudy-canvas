import { createId } from "@core";

import { STICKY_COLORS, STICKY_SIZE, type StickyShape } from "../document";
import type { ParsedNote } from "./dbml";

/** A DBML sticky note as a board sticky linked by `noteName`. Existing stickies keep their place and size. */
export function buildNote(parsed: ParsedNote, existing: StickyShape | undefined): StickyShape {
  return {
    id: existing?.id ?? createId(),
    type: "sticky",
    index: existing?.index ?? "",
    x: existing?.x ?? 0,
    y: existing?.y ?? 0,
    w: existing?.w ?? STICKY_SIZE,
    h: existing?.h ?? STICKY_SIZE,
    color: parsed.headerColor ?? STICKY_COLORS[0].value,
    text: parsed.text,
    noteName: parsed.name,
  };
}
