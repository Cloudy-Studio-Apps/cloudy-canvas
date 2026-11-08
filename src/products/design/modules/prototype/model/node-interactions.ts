import type { CanvasElement } from "@canvas";

import type { PrototypeInteraction } from "./interaction.types";
import { readInteraction } from "./read-interaction";

/**
 * A node's interactions (its optional `interactions` field), read defensively: the ones that can
 * play, in order; `[]` when it has none or they're malformed.
 */
export function nodeInteractions(el: CanvasElement | undefined): PrototypeInteraction[] {
  const stored = (el as { interactions?: unknown } | undefined)?.interactions;
  if (!Array.isArray(stored)) return [];
  const list: PrototypeInteraction[] = [];
  for (const value of stored) {
    const interaction = readInteraction(value);
    if (interaction) list.push(interaction);
  }
  return list;
}
