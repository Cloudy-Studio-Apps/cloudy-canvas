import { Matrix, type GraphicsPath } from "pixi.js";

import type { Point } from "../../geometry.types";
import type { PathContour } from "../../path";
import { arcToCubics } from "../../svg/svg-arc";
import type { At } from "./path-data.types";
import { num } from "./svg-format";

/** How far a cubic's handles reach to follow a quarter circle. */
const KAPPA = 0.5522847498;
const QUARTER = Math.PI / 2;

/** Builds path data, leaving out moves nothing is drawn from. */
class PathWriter {
  private readonly parts: string[] = [];
  private pending: Point | null = null;
  private start: Point | null = null;
  at: Point | null = null;

  move(p: Point): void {
    this.pending = p;
    this.start = p;
    this.at = p;
  }

  line(p: Point): void {
    this.begin();
    this.parts.push(`L${num(p.x)} ${num(p.y)}`);
    this.at = p;
  }

  quad(c: Point, p: Point): void {
    this.begin();
    this.parts.push(`Q${num(c.x)} ${num(c.y)} ${num(p.x)} ${num(p.y)}`);
    this.at = p;
  }

  cubic(c1: Point, c2: Point, p: Point): void {
    this.begin();
    this.parts.push(`C${num(c1.x)} ${num(c1.y)} ${num(c2.x)} ${num(c2.y)} ${num(p.x)} ${num(p.y)}`);
    this.at = p;
  }

  close(): void {
    if (this.pending) return;
    this.parts.push("Z");
    this.at = this.start;
    this.pending = this.start;
  }

  toString(): string {
    return this.parts.join("");
  }

  private begin(): void {
    if (!this.pending) return;
    this.parts.push(`M${num(this.pending.x)} ${num(this.pending.y)}`);
    this.pending = null;
  }
}

/**
 * A Pixi path as SVG path data, taken through `transform`. `null` for what it has no writing for
 * (shapes the app doesn't draw, like `roundPoly`): the caller flattens it instead.
 */
export function pathData(path: GraphicsPath, transform: Matrix | null = null): string | null {
  const writer = new PathWriter();
  return tracePath(path, transform, writer) ? writer.toString() : null;
}

/** Each hole of a `cut` path as its own path data, or `null` when one can't be written. */
export function holePieces(path: GraphicsPath, transform: Matrix | null = null): string[] | null {
  const first = new PathWriter();
  const pieces: string[] = [];
  for (const { action, data } of path.instructions) {
    const piece = action === "addPath" ? pathData(data[0] as GraphicsPath, transform) : null;
    if (action === "addPath" && piece === null) return null;
    if (piece !== null) pieces.push(piece);
    else if (!traceInstruction(action, data as unknown[], transform, first)) return null;
  }
  return [first.toString(), ...pieces].filter(Boolean);
}

/** Glyph or vector contours as SVG path data. */
export function contoursData(contours: readonly PathContour[]): string {
  const writer = new PathWriter();
  for (const contour of contours) {
    writer.move(contour.start);
    for (const { c1, c2, to } of contour.segments) writer.cubic(c1, c2, to);
    if (contour.closed) writer.close();
  }
  return writer.toString();
}

function tracePath(path: GraphicsPath, base: Matrix | null, out: PathWriter): boolean {
  for (const { action, data } of path.instructions) {
    if (!traceInstruction(action, data as unknown[], base, out)) return false;
  }
  return true;
}

function traceInstruction(
  action: string,
  data: unknown[],
  base: Matrix | null,
  out: PathWriter,
): boolean {
  const n = data as number[];
  const at: At = (x, y, m = base) =>
    m ? { x: m.a * x + m.c * y + m.tx, y: m.b * x + m.d * y + m.ty } : { x, y };
  switch (action) {
    case "moveTo":
      out.move(at(n[0]!, n[1]!));
      return true;
    case "lineTo":
      out.line(at(n[0]!, n[1]!));
      return true;
    case "quadraticCurveTo":
      out.quad(at(n[0]!, n[1]!), at(n[2]!, n[3]!));
      return true;
    case "bezierCurveTo":
      out.cubic(at(n[0]!, n[1]!), at(n[2]!, n[3]!), at(n[4]!, n[5]!));
      return true;
    case "closePath":
      out.close();
      return true;
    case "addPath":
      return tracePath(data[0] as GraphicsPath, chain(base, data[1]), out);
    case "rect":
      traceRect(n, at, chain(base, data[4]), out);
      return true;
    case "roundRect":
      traceRoundRect(n, at, chain(base, data[5]), out);
      return true;
    case "circle":
      traceEllipse(n[0]!, n[1]!, n[2]!, n[2]!, at, chain(base, data[3]), out);
      return true;
    case "ellipse":
      traceEllipse(n[0]!, n[1]!, n[2]!, n[3]!, at, chain(base, data[4]), out);
      return true;
    case "poly":
      tracePoly(data[0] as number[] | Point[], data[1] !== false, at, chain(base, data[2]), out);
      return true;
    case "arc":
      traceArc(n, at, out);
      return true;
    case "arcTo":
      traceArcTo(at(n[0]!, n[1]!), at(n[2]!, n[3]!), n[4]!, out);
      return true;
    case "arcToSvg": {
      const to = at(n[5]!, n[6]!);
      const from = out.at ?? to;
      for (const [c1, c2, end] of arcToCubics(from, n[0]!, n[1]!, n[2]!, !!n[3], !!n[4], to)) {
        out.cubic(c1, c2, end);
      }
      if (!out.at) out.move(to);
      return true;
    }
    default:
      return false;
  }
}

/** `own` (a shape's transform) applied first, then `base`. */
function chain(base: Matrix | null, own: unknown): Matrix | null {
  if (!(own instanceof Matrix)) return base;
  return base ? base.clone().append(own) : own;
}

function traceRect(n: number[], at: At, m: Matrix | null, out: PathWriter): void {
  const [x, y, w, h] = n as [number, number, number, number];
  out.move(at(x, y, m));
  out.line(at(x + w, y, m));
  out.line(at(x + w, y + h, m));
  out.line(at(x, y + h, m));
  out.close();
}

function traceRoundRect(n: number[], at: At, m: Matrix | null, out: PathWriter): void {
  const [x, y, w, h] = n as [number, number, number, number];
  const r = Math.min(n[4] ?? 0, w / 2, h / 2);
  if (r <= 0) return traceRect(n, at, m, out);
  const k = r * (1 - KAPPA);
  const right = x + w;
  const bottom = y + h;
  out.move(at(x + r, y, m));
  out.line(at(right - r, y, m));
  out.cubic(at(right - k, y, m), at(right, y + k, m), at(right, y + r, m));
  out.line(at(right, bottom - r, m));
  out.cubic(at(right, bottom - k, m), at(right - k, bottom, m), at(right - r, bottom, m));
  out.line(at(x + r, bottom, m));
  out.cubic(at(x + k, bottom, m), at(x, bottom - k, m), at(x, bottom - r, m));
  out.line(at(x, y + r, m));
  out.cubic(at(x, y + k, m), at(x + k, y, m), at(x + r, y, m));
  out.close();
}

function traceEllipse(
  x: number,
  y: number,
  rx: number,
  ry: number,
  at: At,
  m: Matrix | null,
  out: PathWriter,
): void {
  const kx = rx * KAPPA;
  const ky = ry * KAPPA;
  out.move(at(x + rx, y, m));
  out.cubic(at(x + rx, y + ky, m), at(x + kx, y + ry, m), at(x, y + ry, m));
  out.cubic(at(x - kx, y + ry, m), at(x - rx, y + ky, m), at(x - rx, y, m));
  out.cubic(at(x - rx, y - ky, m), at(x - kx, y - ry, m), at(x, y - ry, m));
  out.cubic(at(x + kx, y - ry, m), at(x + rx, y - ky, m), at(x + rx, y, m));
  out.close();
}

function tracePoly(
  points: number[] | Point[],
  close: boolean,
  at: At,
  m: Matrix | null,
  out: PathWriter,
): void {
  const list: Point[] =
    typeof points[0] === "number"
      ? (points as number[]).flatMap((value, i, all) =>
          i % 2 === 0 ? [{ x: value, y: all[i + 1]! }] : [],
        )
      : (points as Point[]);
  list.forEach((p, i) => {
    const placed = at(p.x, p.y, m);
    if (i === 0) out.move(placed);
    else out.line(placed);
  });
  if (close) out.close();
}

/** Canvas's `arc`: joined to the path by a line, in steps of a quarter turn at most. */
function traceArc(n: number[], at: At, out: PathWriter): void {
  const [cx, cy, radius, start, end] = n as [number, number, number, number, number];
  let turn = end - start;
  if (n[5]) {
    if (turn > 0) turn = turn % (Math.PI * 2) || Math.PI * 2;
    turn = turn > 0 ? turn - Math.PI * 2 : Math.max(turn, -Math.PI * 2);
  } else {
    if (turn < 0) turn = (turn % (Math.PI * 2)) + Math.PI * 2;
    turn = Math.min(turn, Math.PI * 2);
  }
  const point = (angle: number) => at(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
  if (out.at) out.line(point(start));
  else out.move(point(start));
  const steps = Math.max(1, Math.ceil(Math.abs(turn) / QUARTER));
  const step = turn / steps;
  const k = (4 / 3) * Math.tan(step / 4) * radius;
  for (let i = 0; i < steps; i++) {
    const a = start + step * i;
    const b = a + step;
    out.cubic(
      at(cx + radius * Math.cos(a) - k * Math.sin(a), cy + radius * Math.sin(a) + k * Math.cos(a)),
      at(cx + radius * Math.cos(b) + k * Math.sin(b), cy + radius * Math.sin(b) - k * Math.cos(b)),
      point(b),
    );
  }
}

/** Canvas's `arcTo`: a line to where the circle touches, then the arc round the corner. */
function traceArcTo(corner: Point, to: Point, radius: number, out: PathWriter): void {
  const from = out.at ?? corner;
  const inX = from.x - corner.x;
  const inY = from.y - corner.y;
  const outX = to.x - corner.x;
  const outY = to.y - corner.y;
  const inLength = Math.hypot(inX, inY);
  const outLength = Math.hypot(outX, outY);
  const cross = inX * outY - inY * outX;
  if (!out.at) out.move(from);
  if (inLength === 0 || outLength === 0 || cross === 0 || radius <= 0) return out.line(corner);
  const angle = Math.acos(
    Math.max(-1, Math.min(1, (inX * outX + inY * outY) / (inLength * outLength))),
  );
  const reach = radius / Math.tan(angle / 2);
  const a = { x: corner.x + (inX / inLength) * reach, y: corner.y + (inY / inLength) * reach };
  const b = { x: corner.x + (outX / outLength) * reach, y: corner.y + (outY / outLength) * reach };
  out.line(a);
  for (const [c1, c2, end] of arcToCubics(a, radius, radius, 0, false, cross < 0, b)) {
    out.cubic(c1, c2, end);
  }
}
