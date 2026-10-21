import type { DbCardElement } from "../../card";
import { isDbTable, noteBubbleLayout } from "../../table";
import type { CardFootprint } from "./schema-graph.types";

/** The card's size including its visible note bubbles, so tidied cards don't cover them. */
export function cardFootprint(card: DbCardElement): CardFootprint {
  const notes = isDbTable(card) ? noteBubbleLayout(card) : null;
  if (!notes) return { w: card.w, h: card.h };
  const rects = notes.hidden ? [notes.icon] : notes.bubbles.map((bubble) => bubble.rect);
  return {
    w: Math.max(card.w, ...rects.map((rect) => rect.x + rect.w - card.x)),
    h: Math.max(card.h, ...rects.map((rect) => rect.y + rect.h - card.y)),
  };
}
