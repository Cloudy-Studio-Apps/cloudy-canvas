import { hexColor, nonNegative, pointArg, type EffectReader } from "../core";
import { EFFECT_DEFAULTS } from "./effect.defaults";
import type { EffectFieldReader } from "./effect-args.types";
import type { DesignEffectType } from "./effect.types";

const number: EffectFieldReader = (value, key) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`"${key}" must be a number.`);
  }
  return value;
};
const fraction: EffectFieldReader = (value, key) => {
  const n = number(value, key) as number;
  if (n < 0 || n > 1) throw new Error(`"${key}" must be from 0 to 1.`);
  return n;
};
const bool: EffectFieldReader = (value, key) => {
  if (typeof value !== "boolean") throw new Error(`"${key}" must be true or false.`);
  return value;
};
const oneOf =
  (...choices: string[]): EffectFieldReader =>
  (value, key) => {
    if (typeof value !== "string" || !choices.includes(value)) {
      throw new Error(`"${key}" must be one of: ${choices.join(", ")}.`);
    }
    return value;
  };
const text: EffectFieldReader = (value, key) => {
  if (typeof value !== "string") throw new Error(`"${key}" must be a string.`);
  return value;
};
const params: EffectFieldReader = (value, key) => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`"${key}" must be an object of uniform values by name.`);
  }
  for (const [name, v] of Object.entries(value)) {
    const ok =
      (typeof v === "number" && Number.isFinite(v)) ||
      (Array.isArray(v) && v.every((n) => typeof n === "number" && Number.isFinite(n)));
    if (!ok) throw new Error(`"${key}.${name}" must be a number or an array of numbers.`);
  }
  return value;
};

const SHADOW = {
  color: hexColor,
  opacity: fraction,
  x: number,
  y: number,
  blur: nonNegative,
  spread: number,
};

/** The built-in effect types' fields, as agents give them (a plugin's type can reuse some). */
export const EFFECT_FIELDS: Record<DesignEffectType, Record<string, EffectFieldReader>> = {
  "drop-shadow": { ...SHADOW, showBehind: bool },
  "inner-shadow": SHADOW,
  "layer-blur": {
    radius: nonNegative,
    progressive: bool,
    start: pointArg,
    end: pointArg,
    startRadius: nonNegative,
  },
  "background-blur": { radius: nonNegative },
  noise: {
    noiseType: oneOf("mono", "duo", "multi"),
    color: hexColor,
    secondColor: hexColor,
    opacity: fraction,
    size: nonNegative,
    density: fraction,
  },
  texture: { size: nonNegative, radius: nonNegative, clipToShape: bool },
  glass: {
    lightAngle: number,
    lightIntensity: fraction,
    refraction: fraction,
    depth: nonNegative,
    dispersion: fraction,
    frost: nonNegative,
    splay: fraction,
  },
  shader: { code: text, params },
};

/** The agent reader of a built-in effect type: its fields checked, missing ones its defaults. */
export function effectReader(type: DesignEffectType): EffectReader {
  return readEffectFields(type, EFFECT_DEFAULTS[type], EFFECT_FIELDS[type]);
}

/**
 * The agent reader of any effect type, a plugin's too: each field given is checked by its reader
 * in `fields` (an unknown one throws, listing them), the rest are `defaults`.
 */
export function readEffectFields(
  type: string,
  defaults: Record<string, unknown>,
  fields: Record<string, EffectFieldReader>,
): EffectReader {
  return (raw, at) => {
    const out: Record<string, unknown> = structuredClone(defaults);
    for (const [key, value] of Object.entries(raw)) {
      if (key === "id" || key === "type" || key === "visible") continue;
      const read = fields[key];
      if (!read) {
        throw new Error(`"${at}" has no "${key}" (${type}: ${Object.keys(fields).join(", ")}).`);
      }
      out[key] = read(value, `${at}.${key}`);
    }
    return out;
  };
}

/** The built-in effect types, in menu order. */
export const EFFECT_TYPES = Object.keys(EFFECT_FIELDS) as DesignEffectType[];
