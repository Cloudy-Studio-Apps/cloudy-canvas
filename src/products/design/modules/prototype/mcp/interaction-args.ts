import type { CanvasDocument, ToolArgs } from "@canvas";
import { createId } from "@shared/core";

import {
  OVERLAY_POSITIONS,
  PROTOTYPE_ACTIONS,
  PROTOTYPE_ANIMATIONS,
  PROTOTYPE_DIRECTIONS,
  PROTOTYPE_EASINGS,
  PROTOTYPE_TARGET_ACTIONS,
  PROTOTYPE_TRIGGERS,
} from "../prototype.constants";
import {
  isScreen,
  isWebAddress,
  readInteraction,
  screenOf,
  type PrototypeInteraction,
} from "../model";

function isRecord(value: unknown): value is ToolArgs {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Throws unless `value` is absent or one of `choices`. */
function checkChoice(at: string, value: unknown, choices: readonly string[]): void {
  if (value === undefined || value === null) return;
  if (typeof value !== "string" || !choices.includes(value)) {
    throw new Error(`${at} must be one of: ${choices.join(", ")}.`);
  }
}

function checkNumber(at: string, value: unknown): void {
  if (value === undefined || value === null) return;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${at} must be a number.`);
  }
}

function checkBoolean(at: string, value: unknown): void {
  if (value !== undefined && value !== null && typeof value !== "boolean") {
    throw new Error(`${at} must be true or false.`);
  }
}

function checkTransition(at: string, value: unknown): void {
  if (value === undefined || value === null) return;
  if (!isRecord(value)) throw new Error(`${at} must be an object.`);
  checkChoice(`${at}.animation`, value.animation, PROTOTYPE_ANIMATIONS);
  checkChoice(`${at}.direction`, value.direction, PROTOTYPE_DIRECTIONS);
  checkChoice(`${at}.easing`, value.easing, PROTOTYPE_EASINGS);
  checkNumber(`${at}.duration`, value.duration);
}

function checkOverlay(at: string, value: unknown): void {
  if (value === undefined || value === null) return;
  if (!isRecord(value)) throw new Error(`${at} must be an object.`);
  checkChoice(`${at}.position`, value.position, OVERLAY_POSITIONS);
  checkBoolean(`${at}.closeOutside`, value.closeOutside);
  checkBoolean(`${at}.dim`, value.dim);
}

/** Checks the screen a `to` names: a screen of the node's page, not the one the node is on. */
function checkTarget(at: string, doc: CanvasDocument, node: string, to: unknown): void {
  if (typeof to !== "string" || to === "") {
    throw new Error(`${at}.to must be a screen's id for this action.`);
  }
  const own = screenOf(doc, node);
  const target = doc.get(to);
  if (!isScreen(target) || target.pageId !== own?.pageId) {
    throw new Error(`${at}.to "${to}" isn't a top-level frame (screen) on the same design page.`);
  }
  if (target.id === own.id) {
    throw new Error(`${at}.to "${to}" is the screen the layer is on: pick another screen.`);
  }
}

/** Throws one message naming `at` (e.g. `interactions[2].url`) for the first thing wrong in `entry`. */
function checkEntry(at: string, doc: CanvasDocument, node: string, entry: unknown): void {
  if (!isRecord(entry)) throw new Error(`${at} must be an object.`);
  const { trigger, action, key, url } = entry;
  if (typeof trigger !== "string" || !PROTOTYPE_TRIGGERS.includes(trigger as never)) {
    throw new Error(`${at}.trigger must be one of: ${PROTOTYPE_TRIGGERS.join(", ")}.`);
  }
  if (typeof action !== "string" || !PROTOTYPE_ACTIONS.includes(action as never)) {
    throw new Error(`${at}.action must be one of: ${PROTOTYPE_ACTIONS.join(", ")}.`);
  }
  if (trigger === "key" && (typeof key !== "string" || key === "")) {
    throw new Error(`${at}.key must be a key name (e.g. "Enter") for the key trigger.`);
  }
  if (trigger === "delay") checkNumber(`${at}.delay`, entry.delay);
  if (PROTOTYPE_TARGET_ACTIONS.includes(action as never)) checkTarget(at, doc, node, entry.to);
  if (action === "link" && (typeof url !== "string" || !isWebAddress(url))) {
    throw new Error(`${at}.url must be an http: or https: address for the link action.`);
  }
  checkTransition(`${at}.transition`, entry.transition);
  checkOverlay(`${at}.overlay`, entry.overlay);
}

/**
 * The interactions an agent gave for `node`, checked field by field (one error naming the first
 * failure's index and field) and then through `readInteraction`, the final gate. An id the agent
 * gave is kept when it's a non-empty string no earlier entry uses; the others get `createId()`.
 */
export function readInteractionArgs(
  doc: CanvasDocument,
  node: string,
  entries: unknown[],
): PrototypeInteraction[] {
  const used = new Set<string>();
  return entries.map((entry, i) => {
    const at = `interactions[${i}]`;
    checkEntry(at, doc, node, entry);
    const given = (entry as ToolArgs).id;
    const id = typeof given === "string" && given !== "" && !used.has(given) ? given : createId();
    used.add(id);
    const interaction = readInteraction({ ...(entry as ToolArgs), id });
    if (!interaction) throw new Error(`${at} can't play: check its trigger, action, to and url.`);
    return interaction;
  });
}
