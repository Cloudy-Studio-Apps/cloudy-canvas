import {
  rectContainsPoint,
  type ElementInteraction,
  type InteractionQuery,
  type Point,
} from "@canvas";

import { EMBED_ACTIONS } from "./embed.actions";
import { EMBED_DEFAULTS } from "./embed.defaults";
import { embedLayout } from "./embed.layout";
import type { EmbedElement } from "./embed.types";

/** The play button reacts a little beyond its circle, so it's easy to hit. */
const PLAY_REACH = 1.5;

/** What a press on a card grabs before selecting it: the play button or the open button. */
export function embedInteractionAt(
  el: EmbedElement,
  p: Point,
  { reach }: InteractionQuery,
): ElementInteraction | null {
  const local = { x: p.x - el.x, y: p.y - el.y };
  const { play, open } = embedLayout(el);
  if (
    play &&
    Math.hypot(local.x - play.x, local.y - play.y) <= EMBED_DEFAULTS.playRadius * PLAY_REACH
  ) {
    return action(el, EMBED_ACTIONS.play);
  }
  if (rectContainsPoint(open, local, reach)) return action(el, EMBED_ACTIONS.open);
  return null;
}

function action(el: EmbedElement, name: string): ElementInteraction {
  return {
    cursor: "pointer",
    press: (ctx) => {
      ctx.activate(el.id, name);
      return null;
    },
  };
}
