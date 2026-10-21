import { NOTE_FONT_SIZE, NOTE_PADDING, noteBubbleLayout } from "../../db";
import {
  DB_BODY_COLOR,
  INK_COLOR,
  MUTED_INK_COLOR,
  NOTE_BUBBLE_COLOR,
  PAPER_SHADOW_COLOR,
  type DbTableShape,
} from "../../document";
import type { ShapeView } from "./shape-view";

const RADIUS = 4;
const TAIL = 8;

/**
 * The table's note as a message bubble beside it (drawn in the table's local coordinates, outside
 * its bounds), or the small icon that brings it back. Returns the text slot keys it used.
 */
export function drawNoteBubble(view: ShapeView, table: DbTableShape): string[] {
  const layout = noteBubbleLayout(table);
  if (!layout) return [];
  const g = view.graphics;
  const ox = -table.x;
  const oy = -table.y;

  if (layout.hidden) {
    const { x, y, w, h } = layout.icon;
    g.roundRect(x + ox, y + oy, w, h, RADIUS)
      .fill({ color: DB_BODY_COLOR })
      .stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.25, width: 1 });
    // A small speech-bubble glyph.
    const gx = x + ox + 5;
    const gy = y + oy + 5;
    g.roundRect(gx, gy, 10, 7, 1.5)
      .moveTo(gx + 2, gy + 7)
      .lineTo(gx + 2, gy + 10)
      .lineTo(gx + 5, gy + 7)
      .stroke({ color: MUTED_INK_COLOR, width: 1.25, join: "round" });
    return [];
  }

  const bubble = layout.bubble!;
  const close = layout.close!;
  const bx = bubble.x + ox;
  const by = bubble.y + oy;
  g.roundRect(bx, by, bubble.w, bubble.h, RADIUS)
    .poly([bx + 1, by + 10, bx - TAIL, by + 14, bx + 1, by + 20])
    .fill({ color: NOTE_BUBBLE_COLOR })
    .roundRect(bx, by, bubble.w, bubble.h, RADIUS)
    .stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.18, width: 1 });

  // ×
  const cx = close.x + ox + close.w / 2;
  const cy = close.y + oy + close.h / 2;
  g.moveTo(cx - 3.5, cy - 3.5)
    .lineTo(cx + 3.5, cy + 3.5)
    .moveTo(cx + 3.5, cy - 3.5)
    .lineTo(cx - 3.5, cy + 3.5)
    .stroke({ color: MUTED_INK_COLOR, width: 1.25, cap: "round" });

  view
    .setTextSlot("note", layout.lines.join("\n"), { fontSize: NOTE_FONT_SIZE, color: INK_COLOR })
    .position.set(bx + NOTE_PADDING, by + NOTE_PADDING);
  return ["note"];
}
