import { PROTOTYPE_OVERLAY_ACTIONS, PROTOTYPE_TARGET_ACTIONS } from "../prototype.constants";
import { DEFAULT_OVERLAY } from "./interaction-defaults";
import type { PrototypeInteraction } from "./interaction.types";

/** The key a `key` trigger listens to when it's first chosen. */
const DEFAULT_KEY = "Enter";

/** The wait of a `delay` trigger when it's first chosen, in milliseconds. */
const DEFAULT_DELAY = 800;

/** The address a `link` action starts with (the model refuses a link without a valid one). */
const DEFAULT_URL = "https://example.com";

/**
 * An interaction with `patch` applied, keeping it readable: a new action drops the fields it
 * doesn't use (`to` and `url`, `overlay`) and gets the ones it needs (`overlay` and `swap` the
 * default overlay, `link` an address); `to` stays between `navigate`, `overlay` and `swap`. A new
 * trigger drops the `key` and `delay` it doesn't use. Pure: the caller writes the result.
 */
export function editInteraction(
  ix: PrototypeInteraction,
  patch: Partial<PrototypeInteraction>,
): PrototypeInteraction {
  const next: PrototypeInteraction = { ...ix, ...patch };
  const { trigger, action } = next;
  if (trigger !== "key") delete next.key;
  else next.key ??= DEFAULT_KEY;
  if (trigger !== "delay") delete next.delay;
  else next.delay ??= DEFAULT_DELAY;
  if (!PROTOTYPE_TARGET_ACTIONS.includes(action)) delete next.to;
  if (action === "link") next.url ??= DEFAULT_URL;
  else delete next.url;
  if (!PROTOTYPE_OVERLAY_ACTIONS.includes(action)) delete next.overlay;
  else next.overlay ??= { ...DEFAULT_OVERLAY };
  return next;
}
