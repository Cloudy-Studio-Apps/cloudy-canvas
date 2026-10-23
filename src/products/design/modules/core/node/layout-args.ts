import type { BoxSides } from "@canvas";

import type {
  AutoLayout,
  LayoutAlign,
  LayoutCounterAlign,
  LayoutSizing,
  NodeSizing,
  SizeLimits,
} from "./node-layout.types";

/** A new auto layout's settings (Figma's: a row, 10 apart, inside 10 of padding). */
export const DEFAULT_AUTO_LAYOUT: AutoLayout = {
  direction: "horizontal",
  wrap: false,
  gap: 10,
  counterGap: 10,
  padding: { top: 10, right: 10, bottom: 10, left: 10 },
  align: "start",
  counterAlign: "start",
  strokesIncluded: false,
  reverseStacking: false,
};

const ALIGNS: readonly LayoutAlign[] = ["start", "center", "end", "space-between"];
const COUNTER_ALIGNS: readonly LayoutCounterAlign[] = ["start", "center", "end", "baseline"];
const SIZINGS: readonly LayoutSizing[] = ["fixed", "hug", "fill"];

/**
 * An agent's `layout`: `null` removes it, an object sets the fields it gives over `base` (or
 * the defaults). `padding` is a number, `[vertical, horizontal]`, `[top, right, bottom, left]` or
 * an object of sides. Throws with a message the agent can act on.
 */
export function readAutoLayout(value: unknown, base: AutoLayout | null): AutoLayout | null {
  if (value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error('"layout" must be an object (or null to remove the auto layout).');
  }
  const args = value as Record<string, unknown>;
  const next: AutoLayout = { ...(base ?? DEFAULT_AUTO_LAYOUT) };
  if (args.direction !== undefined) {
    if (args.direction !== "horizontal" && args.direction !== "vertical") {
      throw new Error('"layout.direction" must be "horizontal" or "vertical".');
    }
    next.direction = args.direction;
  }
  if (args.wrap !== undefined) next.wrap = bool(args.wrap, "wrap");
  if (args.gap !== undefined) next.gap = num(args.gap, "gap");
  if (args.counterGap !== undefined) next.counterGap = num(args.counterGap, "counterGap");
  if (args.padding !== undefined) next.padding = readPadding(args.padding);
  if (args.align !== undefined) next.align = oneOf(args.align, ALIGNS, "align");
  if (args.counterAlign !== undefined) {
    next.counterAlign = oneOf(args.counterAlign, COUNTER_ALIGNS, "counterAlign");
  }
  if (args.strokesIncluded !== undefined) {
    next.strokesIncluded = bool(args.strokesIncluded, "strokesIncluded");
  }
  if (args.reverseStacking !== undefined) {
    next.reverseStacking = bool(args.reverseStacking, "reverseStacking");
  }
  return next;
}

/** An agent's `sizing`: `{ h?, v? }` over `base`, each `fixed`, `hug` or `fill`. */
export function readSizing(value: unknown, base: NodeSizing): NodeSizing {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error('"sizing" must be { h?, v? }, each "fixed", "hug" or "fill".');
  }
  const { h, v } = value as Record<string, unknown>;
  return {
    h: h === undefined ? base.h : oneOf(h, SIZINGS, "sizing.h"),
    v: v === undefined ? base.v : oneOf(v, SIZINGS, "sizing.v"),
  };
}

/** An agent's `sizeLimits`: `{ minW?, maxW?, minH?, maxH? }`, or `null` for none. */
export function readSizeLimits(value: unknown): SizeLimits | null {
  if (value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error('"sizeLimits" must be { minW?, maxW?, minH?, maxH? } or null.');
  }
  const limits: SizeLimits = {};
  for (const key of ["minW", "maxW", "minH", "maxH"] as const) {
    const n = (value as Record<string, unknown>)[key];
    if (n !== undefined && n !== null) limits[key] = num(n, `sizeLimits.${key}`);
  }
  return Object.keys(limits).length > 0 ? limits : null;
}

function readPadding(value: unknown): BoxSides {
  if (typeof value === "number") return sides(num(value, "padding"));
  if (Array.isArray(value)) {
    const n = value.map((item, i) => num(item, `padding[${i}]`));
    if (n.length === 1) return sides(n[0]!);
    if (n.length === 2) return { top: n[0]!, right: n[1]!, bottom: n[0]!, left: n[1]! };
    if (n.length === 4) return { top: n[0]!, right: n[1]!, bottom: n[2]!, left: n[3]! };
  } else if (typeof value === "object" && value !== null) {
    const args = value as Record<string, unknown>;
    const side = (key: keyof BoxSides) =>
      args[key] === undefined ? 0 : num(args[key], `padding.${key}`);
    return { top: side("top"), right: side("right"), bottom: side("bottom"), left: side("left") };
  }
  throw new Error(
    '"layout.padding" must be a number, [vertical, horizontal], [top, right, bottom, left] ' +
      "or { top, right, bottom, left }.",
  );
}

function sides(n: number): BoxSides {
  return { top: n, right: n, bottom: n, left: n };
}

function num(value: unknown, name: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`"${name}" must be a number.`);
  }
  return value;
}

function bool(value: unknown, name: string): boolean {
  if (typeof value !== "boolean") throw new Error(`"layout.${name}" must be true or false.`);
  return value;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], name: string): T {
  if (typeof value === "string" && (allowed as readonly string[]).includes(value))
    return value as T;
  throw new Error(`"${name}" must be one of: ${allowed.join(", ")}.`);
}
