import { createId } from "@shared/core";

import { STICKY_DEFAULTS, type StickyElement } from "../../sticky";
import { STICKY_COLORS } from "../../../palette";
import type { ParsedNote } from "./dbml";

/** A DBML sticky note as a board sticky linked by `noteName`. Existing stickies keep their place and size. */
export function buildNote(parsed: ParsedNote, existing: StickyElement | undefined): StickyElement {
  return {
    id: existing?.id ?? createId(),
    type: "sticky",
    index: existing?.index ?? "",
    x: existing?.x ?? 0,
    y: existing?.y ?? 0,
    w: existing?.w ?? STICKY_DEFAULTS.size.w,
    h: existing?.h ?? STICKY_DEFAULTS.size.h,
    color: parsed.headerColor ?? STICKY_COLORS[0].value,
    text: parsed.text,
    noteName: parsed.name,
  };
}
