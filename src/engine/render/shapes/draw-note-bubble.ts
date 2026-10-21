import type { Graphics } from "pixi.js";

import { NOTE_FONT_SIZE, NOTE_PADDING, noteBubbleLayout, type NoteBubble } from "../../db";
import {
  DB_BODY_COLOR,
  INK_COLOR,
  MUTED_INK_COLOR,
  NOTE_BUBBLE_COLOR,
  PAPER_SHADOW_COLOR,
  type DbTableShape,
} from "../../document";
import type { Point } from "../../geometry.types";
import type { ShapeView } from "./shape-view";

const RADIUS = 4;
const TAIL = 8;
const TAIL_HALF = 5;

/**
 * A table's notes as message bubbles beside it (drawn in the table's local coordinates, outside
 * its bounds): the table note in yellow, column notes in white at their rows. Hidden, just the
 * icon that brings them back. Returns the text slot keys it used.
 */
export function drawNoteBubble(view: ShapeView, table: DbTableShape): string[] {
  const layout = noteBubbleLayout(table);
  if (!layout) return [];
  const g = view.graphics;
  const origin = { x: -table.x, y: -table.y };

  if (layout.hidden) {
    drawIcon(g, layout.icon.x + origin.x, layout.icon.y + origin.y, layout.icon.w);
    return [];
  }

  const keys = layout.bubbles.map((bubble, i) => {
    drawBubble(g, bubble, origin);
    const key = `note:${i}`;
    view
      .setTextSlot(key, bubble.lines.join("\n"), { fontSize: NOTE_FONT_SIZE, color: INK_COLOR })
      .position.set(
        bubble.rect.x + origin.x + NOTE_PADDING,
        bubble.rect.y + origin.y + NOTE_PADDING,
      );
    return key;
  });

  if (layout.close) {
    const cx = layout.close.x + origin.x + layout.close.w / 2;
    const cy = layout.close.y + origin.y + layout.close.h / 2;
    g.moveTo(cx - 3.5, cy - 3.5)
      .lineTo(cx + 3.5, cy + 3.5)
      .moveTo(cx + 3.5, cy - 3.5)
      .lineTo(cx - 3.5, cy + 3.5)
      .stroke({ color: MUTED_INK_COLOR, width: 1.25, cap: "round" });
  }
  return keys;
}

/** A bubble with a tail on its left edge pointing at its row. */
function drawBubble(g: Graphics, { kind, rect, anchorY }: NoteBubble, origin: Point): void {
  const x = rect.x + origin.x;
  const y = rect.y + origin.y;
  const tailY = Math.min(
    Math.max(anchorY + origin.y, y + RADIUS + TAIL_HALF),
    y + rect.h - RADIUS - TAIL_HALF,
  );
  g.roundRect(x, y, rect.w, rect.h, RADIUS)
    .poly([x + 1, tailY - TAIL_HALF, x - TAIL, anchorY + origin.y, x + 1, tailY + TAIL_HALF])
    .fill({ color: kind === "table" ? NOTE_BUBBLE_COLOR : DB_BODY_COLOR })
    .roundRect(x, y, rect.w, rect.h, RADIUS)
    .stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.18, width: 1 });
}

/** The small square with a speech-bubble glyph that shows the notes again. */
function drawIcon(g: Graphics, x: number, y: number, size: number): void {
  g.roundRect(x, y, size, size, RADIUS)
    .fill({ color: DB_BODY_COLOR })
    .stroke({ color: PAPER_SHADOW_COLOR, alpha: 0.25, width: 1 });
  const gx = x + 5;
  const gy = y + 5;
  g.roundRect(gx, gy, 10, 7, 1.5)
    .moveTo(gx + 2, gy + 7)
    .lineTo(gx + 2, gy + 10)
    .lineTo(gx + 5, gy + 7)
    .stroke({ color: MUTED_INK_COLOR, width: 1.25, join: "round" });
}
