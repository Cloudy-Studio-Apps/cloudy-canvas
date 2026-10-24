import type { Point } from "../geometry.types";
import type { PathContour, PathShape } from "../path";
import { arcToCubics } from "./svg-arc";

const COMMAND = /[MmLlHhVvCcSsQqTtAaZz]/y;
const NUMBER = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/y;
const FLAG = /[01]/y;
const SPACE = /[\s,]*/y;

/** How many numbers each command takes. */
const ARITY: Record<string, number> = {
  m: 2,
  l: 2,
  h: 1,
  v: 1,
  c: 6,
  s: 4,
  q: 4,
  t: 2,
  a: 7,
  z: 0,
};

/**
 * SVG path data (`d`) as a shape of cubic contours: every command, absolute and relative, with
 * quadratics raised to cubics and arcs split into cubics. Data past an error is left out, as
 * browsers do.
 */
export function parseSvgPath(d: string): PathShape {
  const tokens = tokenize(d);
  const contours: PathContour[] = [];
  let contour: PathContour | null = null;
  let at: Point = { x: 0, y: 0 };
  let start: Point = at;
  /** The last control point, for S and T's reflections, with the command it came from. */
  let control: { point: Point; quad: boolean } | null = null;
  let command = "";
  let i = 0;

  const begin = (p: Point) => {
    contour = { start: p, segments: [], closed: false };
    contours.push(contour);
    start = p;
    at = p;
  };
  const cubic = (c1: Point, c2: Point, to: Point) => {
    if (!contour) begin(at);
    contour?.segments.push({ c1, c2, to });
    at = to;
  };
  const line = (to: Point) => cubic(at, to, to);
  const quad = (q: Point, to: Point) => {
    const from = at;
    cubic(
      { x: from.x + (2 / 3) * (q.x - from.x), y: from.y + (2 / 3) * (q.y - from.y) },
      { x: to.x + (2 / 3) * (q.x - to.x), y: to.y + (2 / 3) * (q.y - to.y) },
      to,
    );
  };
  const reflect = (quadratic: boolean): Point =>
    control && control.quad === quadratic
      ? { x: 2 * at.x - control.point.x, y: 2 * at.y - control.point.y }
      : at;

  while (i < tokens.length) {
    const token = tokens[i] ?? "";
    if (/[a-z]/i.test(token)) {
      command = token;
      i++;
      if (command.toLowerCase() === "z") {
        if (contour) {
          const open: PathContour = contour;
          if (at.x !== start.x || at.y !== start.y) line(start);
          open.closed = true;
        }
        contour = null;
        at = start;
        control = null;
        continue;
      }
    } else if (!command) {
      break;
    }
    const lower = command.toLowerCase();
    const count = ARITY[lower] ?? 0;
    const values = tokens.slice(i, i + count).map(Number);
    if (values.length < count || values.some((v) => !Number.isFinite(v))) break;
    i += count;
    const relative = command === lower;
    const pt = (x: number, y: number): Point =>
      relative ? { x: at.x + x, y: at.y + y } : { x, y };
    const n = (k: number) => values[k] ?? 0;

    switch (lower) {
      case "m":
        begin(pt(n(0), n(1)));
        // Further pairs after a move are lines.
        command = relative ? "l" : "L";
        control = null;
        break;
      case "l":
        line(pt(n(0), n(1)));
        control = null;
        break;
      case "h":
        line({ x: relative ? at.x + n(0) : n(0), y: at.y });
        control = null;
        break;
      case "v":
        line({ x: at.x, y: relative ? at.y + n(0) : n(0) });
        control = null;
        break;
      case "c": {
        const c2 = pt(n(2), n(3));
        cubic(pt(n(0), n(1)), c2, pt(n(4), n(5)));
        control = { point: c2, quad: false };
        break;
      }
      case "s": {
        const c1 = reflect(false);
        const c2 = pt(n(0), n(1));
        cubic(c1, c2, pt(n(2), n(3)));
        control = { point: c2, quad: false };
        break;
      }
      case "q": {
        const q = pt(n(0), n(1));
        quad(q, pt(n(2), n(3)));
        control = { point: q, quad: true };
        break;
      }
      case "t": {
        const q = reflect(true);
        quad(q, pt(n(0), n(1)));
        control = { point: q, quad: true };
        break;
      }
      case "a": {
        const to = pt(n(5), n(6));
        for (const [c1, c2, end] of arcToCubics(at, n(0), n(1), n(2), n(3) !== 0, n(4) !== 0, to)) {
          cubic(c1, c2, end);
        }
        control = null;
        break;
      }
    }
  }
  return { contours: contours.filter((c) => c.segments.length > 0) };
}

/**
 * Command letters and numbers, in order. An arc's two flags are read one digit each, so packed
 * forms like `a1 1 0 011 1` read as SVG means them.
 */
function tokenize(d: string): string[] {
  const tokens: string[] = [];
  let pos = 0;
  let arcArg = -1;
  const read = (re: RegExp): string | null => {
    re.lastIndex = pos;
    const match = re.exec(d);
    if (!match) return null;
    pos = re.lastIndex;
    return match[0];
  };
  while (pos < d.length) {
    read(SPACE);
    if (pos >= d.length) break;
    const command = read(COMMAND);
    if (command) {
      tokens.push(command);
      arcArg = command.toLowerCase() === "a" ? 0 : -1;
      continue;
    }
    const isFlag = arcArg === 3 || arcArg === 4;
    const value = read(isFlag ? FLAG : NUMBER);
    if (value === null) break;
    tokens.push(value);
    if (arcArg >= 0) arcArg = (arcArg + 1) % 7;
  }
  return tokens;
}
