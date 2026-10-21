import type { DbTableShape } from "../document";
import type { Rect } from "../geometry.types";
import { measureWrapped } from "../text/text-metrics";
import type { NoteBubbleLayout } from "./note-bubble.types";

export const NOTE_FONT_SIZE = 12;
/** Space between the table and its bubble (room for the tail). */
const GAP = 14;
const MAX_TEXT_W = 200;
export const NOTE_PADDING = 10;
const CLOSE_SIZE = 16;
const ICON_SIZE = 20;

/** Wrapped notes by text, so hit-testing on every pointer move doesn't re-measure them. */
const wrapCache = new Map<string, ReturnType<typeof measureWrapped>>();
const WRAP_CACHE_MAX = 256;

function wrapped(note: string): ReturnType<typeof measureWrapped> {
  let result = wrapCache.get(note);
  if (!result) {
    if (wrapCache.size >= WRAP_CACHE_MAX) wrapCache.clear();
    result = measureWrapped(note, NOTE_FONT_SIZE, MAX_TEXT_W);
    wrapCache.set(note, result);
  }
  return result;
}

/**
 * Where a table's note bubble goes: to the right of its header, with an × in its corner. When
 * hidden, only a small message icon at the table's top-right corner remains. World coordinates.
 */
export function noteBubbleLayout(table: DbTableShape): NoteBubbleLayout | null {
  if (!table.note) return null;
  const icon: Rect = { x: table.x + table.w + 6, y: table.y, w: ICON_SIZE, h: ICON_SIZE };
  if (table.noteHidden) return { hidden: true, icon, bubble: null, close: null, lines: [] };

  const text = wrapped(table.note);
  const bubble: Rect = {
    x: table.x + table.w + GAP,
    y: table.y,
    w: text.w + NOTE_PADDING * 2 + CLOSE_SIZE,
    h: Math.max(text.h + NOTE_PADDING * 2, CLOSE_SIZE + 8),
  };
  const close: Rect = {
    x: bubble.x + bubble.w - CLOSE_SIZE - 4,
    y: bubble.y + 4,
    w: CLOSE_SIZE,
    h: CLOSE_SIZE,
  };
  return { hidden: false, icon, bubble, close, lines: text.lines };
}
