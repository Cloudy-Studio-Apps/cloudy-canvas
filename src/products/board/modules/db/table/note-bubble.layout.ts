import { measureWrapped, type Rect } from "@canvas";

import { DB_CARD_DEFAULTS, rowTop } from "../card";
import type { DbTableElement } from "./db-table.types";
import type { NoteBubble, NoteBubbleLayout } from "./note-bubble.layout.types";

const { headerHeight, rowHeight } = DB_CARD_DEFAULTS;
/** Note text size and the space around it inside a bubble. */
export const NOTE_BUBBLE_TEXT = { fontSize: 12, padding: 8 } as const;
const { fontSize: NOTE_FONT_SIZE, padding: NOTE_PADDING } = NOTE_BUBBLE_TEXT;
/** Space between the table and its bubbles (room for the tails). */
const GAP = 14;
/** Vertical space between stacked bubbles. */
const STACK_GAP = 4;
const MAX_TEXT_W = 200;
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
 * The note bubbles to the right of a table: the table's note beside its header, then one per
 * annotated column at that row's height (pushed down when they'd overlap). One × on the first
 * bubble hides them all; hidden, only a small message icon remains. World coordinates.
 */
export function noteBubbleLayout(table: DbTableElement): NoteBubbleLayout | null {
  const notes: { kind: NoteBubble["kind"]; text: string; anchorY: number }[] = [];
  if (table.note)
    notes.push({ kind: "table", text: table.note, anchorY: table.y + headerHeight / 2 });
  table.columns.forEach((column, row) => {
    if (column.note) {
      notes.push({
        kind: "column",
        text: column.note,
        anchorY: table.y + rowTop(row) + rowHeight / 2,
      });
    }
  });
  if (notes.length === 0) return null;

  const icon: Rect = { x: table.x + table.w + 6, y: table.y, w: ICON_SIZE, h: ICON_SIZE };
  if (table.noteHidden) return { hidden: true, icon, bubbles: [], close: null };

  const x = table.x + table.w + GAP;
  let nextY = -Infinity;
  const bubbles = notes.map((note, i): NoteBubble => {
    const text = wrapped(note.text);
    const extra = i === 0 ? CLOSE_SIZE : 0;
    const h = Math.max(text.h + NOTE_PADDING * 2, i === 0 ? CLOSE_SIZE + 8 : 0);
    // Centered on its row, unless that would overlap the bubble above.
    const y = Math.max(note.kind === "table" ? table.y : note.anchorY - h / 2, nextY);
    nextY = y + h + STACK_GAP;
    return {
      kind: note.kind,
      rect: { x, y, w: text.w + NOTE_PADDING * 2 + extra, h },
      lines: text.lines,
      anchorY: note.anchorY,
    };
  });

  const first = bubbles[0]!.rect;
  const close: Rect = {
    x: first.x + first.w - CLOSE_SIZE - 4,
    y: first.y + 4,
    w: CLOSE_SIZE,
    h: CLOSE_SIZE,
  };
  return { hidden: false, icon, bubbles, close };
}
