import type { Point, Size } from "../geometry.types";
import { parseCssColor } from "./css-color";
import { rgbaToHex } from "./gradient-color";
import { squareWidth, transformFromHandles } from "./gradient-transforms";
import type { ColorStop, Gradient, GradientHandles, GradientType } from "./gradient.types";

const FUNCTIONS: Record<string, GradientType> = {
  linear: "linear",
  radial: "radial",
  conic: "angular",
};

const SIDES: Record<string, Point> = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const KEYWORD_SPOTS: Record<string, number> = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };

/** The text split at the commas outside parentheses. */
function splitArgs(text: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of text) {
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (char === "," && depth === 0) {
      args.push(current.trim());
      current = "";
    } else current += char;
  }
  args.push(current.trim());
  return args;
}

/** An angle (`deg`, `turn`, `rad`, `grad`; bare numbers are degrees) in degrees, or `null`. */
function angle(text: string): number | null {
  const match = /^(-?[\d.]+)(deg|turn|rad|grad)?$/.exec(text.trim());
  if (!match) return null;
  const value = parseFloat(match[1]!);
  const unit = match[2] ?? "deg";
  return unit === "turn"
    ? value * 360
    : unit === "rad"
      ? (value * 180) / Math.PI
      : unit === "grad"
        ? value * 0.9
        : value;
}

/** A length on an axis `length` long (percentages or `px`), as a fraction of it, or `null`. */
function fractionOf(text: string, length: number): number | null {
  const keyword = KEYWORD_SPOTS[text];
  if (keyword !== undefined) return keyword;
  const match = /^(-?[\d.]+)(%|px)?$/.exec(text);
  if (!match) return null;
  const value = parseFloat(match[1]!);
  return match[2] === "%" ? value / 100 : value / Math.max(length, 1e-9);
}

/** The color stop `text` ("color [position]"), its position a fraction or `undefined`. */
function readStop(text: string, conic: boolean): { stop: ColorStop; position?: number } {
  const match = /^(.*?)(?:\s+(-?[\d.]+(?:%|deg|turn)?))?$/.exec(text.trim());
  const color = match ? parseCssColor(match[1]!) : null;
  if (!match || !color)
    throw new Error(`"${text}" isn't a color stop (a color, then an optional position).`);
  const raw = match[2];
  let position: number | undefined;
  if (raw !== undefined) {
    position = raw.endsWith("%")
      ? parseFloat(raw) / 100
      : conic
        ? (angle(raw) ?? 0) / 360
        : parseFloat(raw) / 100;
  }
  return {
    stop: { position: 0, color: rgbaToHex(color), opacity: Math.round(color.a * 100) / 100 },
    position,
  };
}

/** Stops without a position spread out between their neighbors, as CSS places them. */
function placeStops(read: { stop: ColorStop; position?: number }[]): ColorStop[] {
  const positions = read.map((r) => r.position);
  if (positions[0] === undefined) positions[0] = 0;
  if (positions[positions.length - 1] === undefined) positions[positions.length - 1] = 1;
  let last = 0;
  for (let i = 0; i < positions.length; i++) {
    const known = positions[i];
    if (known === undefined) continue;
    for (let gap = last + 1; gap < i; gap++) {
      const from = positions[last]!;
      positions[gap] = from + ((known - from) * (gap - last)) / (i - last);
    }
    last = i;
  }
  let floor = -Infinity;
  return read.map(({ stop }, i) => {
    floor = Math.max(floor, positions[i]!);
    return { ...stop, position: Math.round(Math.min(1, Math.max(0, floor)) * 1000) / 1000 };
  });
}

/** Where `at x y` puts the center, as a normalized point (the middle when it's left out). */
function readCenter(words: string[], size: Size): Point {
  const at = words.indexOf("at");
  if (at === -1) return { x: 0.5, y: 0.5 };
  const [first = "center", second = "center"] = words.slice(at + 1);
  // Keywords may come in either order ("top left").
  const swapped = first === "top" || first === "bottom" || second === "left" || second === "right";
  const [xWord, yWord] = swapped ? [second, first] : [first, second];
  const x = fractionOf(xWord, size.w);
  const y = fractionOf(yWord, size.h);
  if (x === null || y === null) throw new Error(`"at ${first} ${second}" isn't a position.`);
  return { x, y };
}

function linearHandles(config: string | null, size: Size): GradientHandles {
  let degrees = 180;
  if (config) {
    const words = config.split(/\s+/);
    if (words[0] === "to") {
      const direction = words.slice(1).reduce(
        (sum, word) => {
          const side = SIDES[word];
          if (!side) throw new Error(`"${config}" isn't a direction.`);
          return { x: sum.x + side.x, y: sum.y + side.y };
        },
        { x: 0, y: 0 },
      );
      degrees = (Math.atan2(direction.x * size.h, -direction.y * size.w) * 180) / Math.PI;
    } else {
      const read = angle(config);
      if (read === null) throw new Error(`"${config}" isn't an angle or a direction.`);
      degrees = read;
    }
  }
  const radians = (degrees * Math.PI) / 180;
  const ux = Math.sin(radians);
  const uy = -Math.cos(radians);
  const line = Math.abs(size.w * ux) + Math.abs(size.h * uy);
  const start = { x: 0.5 - (ux * line) / 2 / size.w, y: 0.5 - (uy * line) / 2 / size.h };
  const end = { x: 0.5 + (ux * line) / 2 / size.w, y: 0.5 + (uy * line) / 2 / size.h };
  return { start, end, width: squareWidth(start, end, size, 0.5) };
}

function radialHandles(config: string | null, size: Size): GradientHandles {
  const words = config ? config.split(/\s+/) : [];
  const center = readCenter(words, size);
  const before = words.indexOf("at") === -1 ? words : words.slice(0, words.indexOf("at"));
  const circle = before.includes("circle");
  const lengths = before.filter((w) => w !== "circle" && w !== "ellipse" && !w.includes("-"));
  let rx = 0.5;
  let ry = 0.5;
  if (lengths.length > 0) {
    const x = fractionOf(lengths[0]!, size.w);
    const y = fractionOf(lengths[1] ?? lengths[0]!, size.h);
    if (x === null || y === null) throw new Error(`"${lengths.join(" ")}" isn't a size.`);
    rx = x;
    ry = lengths[1] === undefined && /px$/.test(lengths[0]!) ? (x * size.w) / size.h : y;
  } else if (circle) {
    const radius = Math.min(size.w, size.h) / 2;
    rx = radius / size.w;
    ry = radius / size.h;
  }
  return {
    start: center,
    end: { x: center.x + rx, y: center.y },
    width: { x: center.x, y: center.y + ry },
  };
}

function conicHandles(config: string | null, size: Size): GradientHandles {
  const words = config ? config.split(/\s+/) : [];
  const center = readCenter(words, size);
  const from = words.indexOf("from");
  const degrees = from === -1 ? 0 : angle(words[from + 1] ?? "");
  if (degrees === null) throw new Error(`"${config}" has no angle after "from".`);
  const radians = ((degrees - 90) * Math.PI) / 180;
  const radius = Math.min(size.w, size.h) / 2;
  const end = {
    x: center.x + (Math.cos(radians) * radius) / size.w,
    y: center.y + (Math.sin(radians) * radius) / size.h,
  };
  return { start: center, end, width: squareWidth(center, end, size, 1) };
}

/**
 * A CSS `linear-gradient`, `radial-gradient` or `conic-gradient` as a gradient laid on a box of
 * `size` (a square when unknown); throws saying what's wrong when it isn't one.
 */
export function parseCssGradient(text: string, size: Size = { w: 1, h: 1 }): Gradient {
  const match = /^\s*(repeating-)?(linear|radial|conic)-gradient\(([\s\S]*)\)\s*;?\s*$/i.exec(text);
  if (!match) throw new Error(`"${text}" isn't a CSS linear, radial or conic gradient.`);
  if (match[1]) throw new Error("Repeating gradients aren't supported.");
  const type = FUNCTIONS[match[2]!.toLowerCase()]!;
  const args = splitArgs(match[3]!.toLowerCase());
  const config = args[0] !== undefined && !readsAsStop(args[0]) ? args.shift()! : null;
  if (args.length < 2) throw new Error("A gradient needs at least two color stops.");
  const stops = placeStops(args.map((arg) => readStop(arg, type === "angular")));
  const handles =
    type === "linear"
      ? linearHandles(config, size)
      : type === "radial"
        ? radialHandles(config, size)
        : conicHandles(config, size);
  return { type, stops, transform: transformFromHandles(type, handles, size) };
}

function readsAsStop(arg: string): boolean {
  try {
    readStop(arg, false);
    return true;
  } catch {
    return false;
  }
}
