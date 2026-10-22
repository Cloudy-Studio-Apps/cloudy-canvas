import type { Point, Size } from "../geometry.types";
import {
  affineFromPoints,
  applyAffine,
  IDENTITY_TRANSFORM,
  invertAffine,
  multiplyAffine,
} from "./affine";
import type { GradientHandles, GradientTransform, GradientType } from "./gradient.types";

/** Where each handle sits in gradient space, by type. */
function anchors(type: GradientType): [Point, Point, Point] {
  return type === "linear"
    ? [
        { x: 0, y: 0.5 },
        { x: 1, y: 0.5 },
        { x: 0, y: 1 },
      ]
    : [
        { x: 0.5, y: 0.5 },
        { x: 1, y: 0.5 },
        { x: 0.5, y: 1 },
      ];
}

/**
 * Figma's starting transform for a type: a linear gradient runs from the top middle to the bottom
 * middle; the others are centered, reaching the box's edges.
 */
export function defaultGradientTransform(type: GradientType): GradientTransform {
  return type === "linear"
    ? [
        [0, 1, 0],
        [-1, 0, 1],
      ]
    : IDENTITY_TRANSFORM;
}

/** The handles of a gradient, in the box's normalized space. */
export function gradientHandles(type: GradientType, t: GradientTransform): GradientHandles {
  const inverse = invertAffine(t) ?? IDENTITY_TRANSFORM;
  const [start, end, width] = anchors(type).map((p) => applyAffine(inverse, p)) as [
    Point,
    Point,
    Point,
  ];
  return { start, end, width };
}

/**
 * The transform its handles describe on a box of `size`. A linear gradient's `width` is ignored:
 * its lines stay square to the start–end line on screen. Handles on one point keep `fallback`.
 */
export function transformFromHandles(
  type: GradientType,
  handles: GradientHandles,
  size: Size,
  fallback: GradientTransform = defaultGradientTransform(type),
): GradientTransform {
  const width =
    type === "linear" ? squareWidth(handles.start, handles.end, size, 0.5) : handles.width;
  return affineFromPoints([handles.start, handles.end, width], anchors(type)) ?? fallback;
}

/**
 * The point square to `start`–`end` on screen (a box of `size`) from `start`, `ratio` times as far
 * as `end`, turned clockwise.
 */
export function squareWidth(start: Point, end: Point, size: Size, ratio: number): Point {
  const w = Math.max(size.w, 1e-6);
  const h = Math.max(size.h, 1e-6);
  const dx = (end.x - start.x) * w;
  const dy = (end.y - start.y) * h;
  return { x: start.x + (-dy * ratio) / w, y: start.y + (dx * ratio) / h };
}

/** On screen, how long `p - from` is (normalized points on a box of `size`). */
export function screenLength(from: Point, p: Point, size: Size): number {
  return Math.hypot((p.x - from.x) * size.w, (p.y - from.y) * size.h);
}

/** A quarter turn of the normalized box round its middle, clockwise. */
const QUARTER_TURN: GradientTransform = [
  [0, 1, 0],
  [-1, 0, 1],
];

/** The gradient turned a quarter clockwise round the box's middle. */
export function rotateGradient90(t: GradientTransform): GradientTransform {
  return multiplyAffine(t, QUARTER_TURN);
}

/** The gradient mirrored in the box: `x` left to right, `y` top to bottom. */
export function flipGradient(t: GradientTransform, axis: "x" | "y"): GradientTransform {
  const mirror: GradientTransform =
    axis === "x"
      ? [
          [-1, 0, 1],
          [0, 1, 0],
        ]
      : [
          [1, 0, 0],
          [0, -1, 1],
        ];
  return multiplyAffine(t, mirror);
}

/** Where `t` (0–1 along the gradient) lies between a linear gradient's handles. */
export function pointAlong(handles: GradientHandles, t: number): Point {
  return {
    x: handles.start.x + (handles.end.x - handles.start.x) * t,
    y: handles.start.y + (handles.end.y - handles.start.y) * t,
  };
}
