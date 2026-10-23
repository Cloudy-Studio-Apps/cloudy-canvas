import {
  applyAffine,
  IDENTITY_TRANSFORM,
  invertAffine,
  multiplyAffine,
  roundAffine,
} from "../gradient";
import type { Point, Rect, Size } from "../geometry.types";
import type { ImageCrop, ImageRotation, ImageTransform } from "./image-transform.types";

const EPSILON = 1e-9;

function translate(x: number, y: number): ImageTransform {
  return [
    [1, 0, x],
    [0, 1, y],
  ];
}

function scale(x: number, y: number): ImageTransform {
  return [
    [x, 0, 0],
    [0, y, 0],
  ];
}

function rotate(degrees: number): ImageTransform {
  const a = (degrees * Math.PI) / 180;
  const cos = Math.round(Math.cos(a) * 1e12) / 1e12;
  const sin = Math.round(Math.sin(a) * 1e12) / 1e12;
  return [
    [cos, -sin, 0],
    [sin, cos, 0],
  ];
}

function chain(...transforms: ImageTransform[]): ImageTransform {
  return transforms.reduce((t, s) => multiplyAffine(t, s), IDENTITY_TRANSFORM);
}

function inverse(t: ImageTransform): ImageTransform {
  return invertAffine(t) ?? IDENTITY_TRANSFORM;
}

/**
 * The transform that shows the picture as `contain` (`fit`) or `cover` (`fill`) would, turned by
 * `rotation`, in a box of `box` size: what a crop starts from, so it begins with what was shown.
 */
export function fitTransform(
  mode: "contain" | "cover",
  box: Size,
  image: Size,
  rotation: ImageRotation = 0,
): ImageTransform {
  const w = Math.max(box.w, EPSILON);
  const h = Math.max(box.h, EPSILON);
  const turned = rotation === 90 || rotation === 270;
  const iw = Math.max(image.w, EPSILON);
  const ih = Math.max(image.h, EPSILON);
  const rw = turned ? ih : iw;
  const rh = turned ? iw : ih;
  const s = mode === "cover" ? Math.max(w / rw, h / rh) : Math.min(w / rw, h / rh);
  // The image's normalized space to the layer's: to pixels, centered, scaled, turned, placed.
  const toLayer = chain(
    scale(1 / w, 1 / h),
    translate(w / 2, h / 2),
    rotate(rotation),
    scale(s, s),
    translate(-iw / 2, -ih / 2),
    scale(iw, ih),
  );
  return roundAffine(inverse(toLayer));
}

/** The transform showing `crop` of the picture over the whole box. */
export function cropTransform(crop: ImageCrop): ImageTransform {
  return [
    [crop.w, 0, crop.x],
    [0, crop.h, crop.y],
  ];
}

/** The part of the picture `t` shows, when it neither turns nor mirrors it; otherwise `null`. */
export function transformCrop(t: ImageTransform): ImageCrop | null {
  const [[a, c, e], [b, d, f]] = t;
  if (Math.abs(b) > 1e-6 || Math.abs(c) > 1e-6 || a <= 0 || d <= 0) return null;
  return { x: e, y: f, w: a, h: d };
}

/** The picture's corners (top-left, top-right, bottom-right, bottom-left) in the layer's box. */
export function imageQuad(t: ImageTransform): [Point, Point, Point, Point] {
  const back = inverse(t);
  return [
    applyAffine(back, { x: 0, y: 0 }),
    applyAffine(back, { x: 1, y: 0 }),
    applyAffine(back, { x: 1, y: 1 }),
    applyAffine(back, { x: 0, y: 1 }),
  ];
}

/** The picture moved by `delta` (in the layer's normalized box). */
export function panTransform(t: ImageTransform, delta: Point): ImageTransform {
  return roundAffine(multiplyAffine(t, translate(-delta.x, -delta.y)));
}

/** The picture scaled by `factor` round `about` (a point of the layer's normalized box). */
export function zoomTransform(t: ImageTransform, factor: number, about: Point): ImageTransform {
  const f = Math.max(factor, EPSILON);
  return roundAffine(
    chain(t, translate(about.x, about.y), scale(1 / f, 1 / f), translate(-about.x, -about.y)),
  );
}

/**
 * `t` for a layer whose box went from `before` to `after` (both in the layer's own, unturned
 * frame), so the picture stays where it was.
 */
export function reframeTransform(t: ImageTransform, before: Rect, after: Rect): ImageTransform {
  const w = Math.max(before.w, EPSILON);
  const h = Math.max(before.h, EPSILON);
  const toBefore: ImageTransform = [
    [after.w / w, 0, (after.x - before.x) / w],
    [0, after.h / h, (after.y - before.y) / h],
  ];
  return roundAffine(multiplyAffine(t, toBefore));
}

/** The picture turned a quarter clockwise round the middle of a box of `box` size. */
export function rotateTransform90(t: ImageTransform, box: Size): ImageTransform {
  const w = Math.max(box.w, EPSILON);
  const h = Math.max(box.h, EPSILON);
  // In world units: turned round the box's middle; back in the box's normalized space.
  const turn = chain(
    scale(1 / w, 1 / h),
    translate(w / 2, h / 2),
    rotate(90),
    translate(-w / 2, -h / 2),
    scale(w, h),
  );
  return roundAffine(multiplyAffine(t, inverse(turn)));
}

/** `crop` kept inside the picture: no bigger than it, moved back in when it hangs out. */
export function clampCrop(crop: ImageCrop): ImageCrop {
  const w = Math.min(1, Math.max(EPSILON, crop.w));
  const h = Math.min(1, Math.max(EPSILON, crop.h));
  return {
    x: Math.min(1 - w, Math.max(0, crop.x)),
    y: Math.min(1 - h, Math.max(0, crop.y)),
    w,
    h,
  };
}

/** Whether `crop` stays inside the picture (with a little slack for rounding). */
export function cropInside(crop: ImageCrop): boolean {
  const slack = 1e-4;
  return (
    crop.x >= -slack &&
    crop.y >= -slack &&
    crop.x + crop.w <= 1 + slack &&
    crop.y + crop.h <= 1 + slack
  );
}

/** The crop that looks like `cover`: the middle of the picture, in the box's proportions. */
export function coverCrop(box: Size, image: Size): ImageCrop {
  const s = Math.max(box.w / Math.max(image.w, EPSILON), box.h / Math.max(image.h, EPSILON));
  const w = Math.min(1, box.w / s / Math.max(image.w, EPSILON));
  const h = Math.min(1, box.h / s / Math.max(image.h, EPSILON));
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}
