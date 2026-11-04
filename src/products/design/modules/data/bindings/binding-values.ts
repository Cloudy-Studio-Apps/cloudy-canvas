import { parseTokenColor, readPath, tokenValueFields } from "@canvas";

import { imagePaint, type DesignNode } from "../../core";
import { toBoolean, toNumber } from "./coerce";
import { formatValue } from "./format-value";
import type { DataBinding } from "./binding.types";
import type { BindingContext, BindingWrite } from "./plan-bindings.types";
import type { LookupResult } from "./scope.types";

/** `fills.<i>.image` / `strokes.<i>.image`: a paint's picture. */
const IMAGE_PATH = /^((?:fills|strokes)\.\d+)\.image$/;

const KEEP: BindingWrite = { values: null, emptyImage: false };

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && !value.trim());
}

/** An image paint's picture: the paint's asset swapped (another paint becomes an image one). */
function imageWrite(
  el: DesignNode,
  paintPath: string,
  value: unknown,
  ctx: BindingContext,
): BindingWrite {
  if (isEmpty(value) || typeof value === "object") return { values: null, emptyImage: true };
  const assetId = ctx.images(String(value));
  const paint = readPath(el, paintPath) as { type?: unknown; opacity?: unknown; visible?: unknown };
  if (assetId === null || typeof paint !== "object" || paint === null) return KEEP;
  if (paint.type === "image")
    return { values: { [`${paintPath}.assetId`]: assetId }, emptyImage: false };
  const next = {
    ...imagePaint(assetId),
    ...(typeof paint.opacity === "number" ? { opacity: paint.opacity } : {}),
    ...(typeof paint.visible === "boolean" ? { visible: paint.visible } : {}),
  };
  return { values: { [paintPath]: next }, emptyImage: false };
}

/**
 * What one binding writes into its field, by what the field holds now: a number is coerced, a
 * color parsed (`#rgb`…`#rrggbbaa`; a paint's alpha goes to its opacity, as variables do), a
 * boolean read, a text formatted; an image paint takes the saved picture's asset. A value that
 * doesn't fit leaves the field alone.
 */
export function bindingWrite(
  el: DesignNode,
  path: string,
  binding: DataBinding,
  read: LookupResult,
  ctx: BindingContext,
): BindingWrite {
  const image = IMAGE_PATH.exec(path);
  if (image) return imageWrite(el, image[1] as string, read.value, ctx);
  const current = readPath(el, path);
  if (current === undefined) return KEEP;
  if (typeof current === "number") {
    const n = toNumber(read.value);
    return n === null
      ? KEEP
      : { values: tokenValueFields(el, path, { type: "number", number: n }), emptyImage: false };
  }
  if (typeof current === "boolean") {
    const b = toBoolean(read.value);
    return b === null ? KEEP : { values: { [path]: b }, emptyImage: false };
  }
  if (typeof current !== "string") return KEEP;
  if (path.endsWith("color") || path.endsWith("Color") || parseTokenColor(current) !== null) {
    const color = typeof read.value === "string" ? parseTokenColor(read.value) : null;
    return color === null
      ? KEEP
      : { values: tokenValueFields(el, path, { type: "color", color }), emptyImage: false };
  }
  const text = formatValue(read.value, read.field, binding.format, ctx.locale);
  return { values: { [path]: text }, emptyImage: false };
}
