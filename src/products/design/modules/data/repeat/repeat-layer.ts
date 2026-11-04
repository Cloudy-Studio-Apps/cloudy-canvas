import type { CanvasDocument } from "@canvas";

import { isDesignNode } from "../../core";
import { isFrame } from "../../frame";
import { REPEAT_ERRORS } from "./repeat-errors";
import { setRepeat } from "./set-repeat";
import type { RepeatSettings } from "./repeat.types";
import type { SetRepeatOptions } from "./set-repeat.types";

/**
 * Repeats a layer (the card) inside its parent frame, which holds and lays out the copies: the
 * shortcut for `setRepeat(doc, parent, { ...repeat, template: cardId }, opts)`. A parent that
 * doesn't repeat yet needs `repeat.source`; one that repeats another card switches to this one.
 * Refuses a layer with no parent frame.
 */
export function repeatLayer(
  doc: CanvasDocument,
  cardId: string,
  repeat: Partial<RepeatSettings> = {},
  opts: SetRepeatOptions = {},
): void {
  const card = doc.get(cardId);
  if (!card || !isDesignNode(card)) throw new Error(`"${cardId}" isn't a layer.`);
  const parent = card.parentId ? doc.get(card.parentId) : undefined;
  if (!parent || !isFrame(parent)) throw new Error(REPEAT_ERRORS.noParentFrame);
  setRepeat(doc, parent.id, { ...repeat, template: cardId }, opts);
}
