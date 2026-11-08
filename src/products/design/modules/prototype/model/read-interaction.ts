import { clamp } from "@canvas";

import {
  MAX_TRANSITION_DURATION,
  MAX_TRIGGER_DELAY,
  OVERLAY_POSITIONS,
  PROTOTYPE_ACTIONS,
  PROTOTYPE_ANIMATIONS,
  PROTOTYPE_DIRECTIONS,
  PROTOTYPE_EASINGS,
  PROTOTYPE_OVERLAY_ACTIONS,
  PROTOTYPE_TARGET_ACTIONS,
  PROTOTYPE_TRIGGERS,
} from "../prototype.constants";
import { DEFAULT_OVERLAY, DEFAULT_TRANSITION } from "./interaction-defaults";
import { isWebAddress } from "./is-web-address";
import type {
  PrototypeInteraction,
  PrototypeOverlay,
  PrototypeTransition,
} from "./interaction.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function oneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** A transition, its missing or unknown fields the default's; `null` for an unknown animation. */
function readTransition(value: unknown): PrototypeTransition | null {
  if (!isRecord(value)) return { ...DEFAULT_TRANSITION };
  const { animation, direction, duration, easing } = value;
  if (animation !== undefined && !oneOf(PROTOTYPE_ANIMATIONS, animation)) return null;
  return {
    animation: animation ?? DEFAULT_TRANSITION.animation,
    direction: oneOf(PROTOTYPE_DIRECTIONS, direction) ? direction : DEFAULT_TRANSITION.direction,
    duration: isNumber(duration)
      ? clamp(duration, 0, MAX_TRANSITION_DURATION)
      : DEFAULT_TRANSITION.duration,
    easing: oneOf(PROTOTYPE_EASINGS, easing) ? easing : DEFAULT_TRANSITION.easing,
  };
}

/** An overlay, its missing or unknown fields the default's. */
function readOverlay(value: unknown): PrototypeOverlay {
  if (!isRecord(value)) return { ...DEFAULT_OVERLAY };
  const { position, closeOutside, dim } = value;
  return {
    position: oneOf(OVERLAY_POSITIONS, position) ? position : DEFAULT_OVERLAY.position,
    closeOutside: typeof closeOutside === "boolean" ? closeOutside : DEFAULT_OVERLAY.closeOutside,
    dim: typeof dim === "boolean" ? dim : DEFAULT_OVERLAY.dim,
  };
}

/**
 * An interaction read defensively from stored data (a file, an agent, a live session's peer), or
 * `null` when it can't play: no id, an unknown trigger, action or animation, a `navigate`,
 * `overlay` or `swap` without a screen (`to`), a `link` without an `http:`/`https:` address.
 * Durations and delays are clamped, a missing transition (or overlay, on `overlay` and `swap`) is
 * the default, and fields the action or trigger doesn't use are dropped.
 */
export function readInteraction(value: unknown): PrototypeInteraction | null {
  if (!isRecord(value)) return null;
  const { id, trigger, key, delay, action, to, url } = value;
  if (typeof id !== "string" || !id) return null;
  if (!oneOf(PROTOTYPE_TRIGGERS, trigger) || !oneOf(PROTOTYPE_ACTIONS, action)) return null;
  const targets = PROTOTYPE_TARGET_ACTIONS.includes(action);
  if (targets && typeof to !== "string") return null;
  if (action === "link" && (typeof url !== "string" || !isWebAddress(url))) return null;
  const transition = readTransition(value.transition);
  if (!transition) return null;
  const interaction: PrototypeInteraction = { id, trigger, action, transition };
  if (trigger === "key" && typeof key === "string") interaction.key = key;
  if (isNumber(delay)) interaction.delay = clamp(delay, 0, MAX_TRIGGER_DELAY);
  if (targets && typeof to === "string") interaction.to = to;
  if (action === "link" && typeof url === "string") interaction.url = url;
  if (PROTOTYPE_OVERLAY_ACTIONS.includes(action)) interaction.overlay = readOverlay(value.overlay);
  return interaction;
}
