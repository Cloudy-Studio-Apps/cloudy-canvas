import { createId } from "@shared/core";

import type { NodeEffect } from "./design-node.types";
import type { EffectReader } from "./effect-args.types";

/**
 * How agents' effects are read, by type: the effects module (and plugins) set theirs when they
 * register, so the shared node checks don't need to know every type.
 */
const readers = new Map<string, EffectReader>();

/** Sets how effects of a type are read from agents (setting it again replaces it). */
export function setEffectReader(type: string, read: EffectReader): void {
  readers.set(type, read);
}

/** The effect types agents can give. */
export function effectTypes(): string[] {
  return [...readers.keys()];
}

/**
 * A full `effects` array from an agent, bottom to top: each `{ type, … }` read by its type's
 * reader (missing fields take the type's defaults), with an `id` (kept when given) and `visible`
 * (default true). Throws naming the field.
 */
export function readNodeEffects(value: unknown, key: string): NodeEffect[] {
  if (!Array.isArray(value)) throw new Error(`"${key}" must be an array of effects.`);
  return value.map((raw, i) => {
    const at = `${key}[${i}]`;
    if (typeof raw !== "object" || raw === null) throw new Error(`"${at}" must be an object.`);
    const fields = raw as Record<string, unknown>;
    const read = typeof fields.type === "string" ? readers.get(fields.type) : undefined;
    if (!read) {
      throw new Error(`"${at}.type" must be one of: ${effectTypes().join(", ")}.`);
    }
    if (fields.visible !== undefined && typeof fields.visible !== "boolean") {
      throw new Error(`"${at}.visible" must be true or false.`);
    }
    return {
      ...read(fields, at),
      id: typeof fields.id === "string" && fields.id ? fields.id : createId(),
      type: fields.type as string,
      visible: fields.visible !== false,
    };
  });
}
