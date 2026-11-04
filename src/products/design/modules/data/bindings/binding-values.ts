import { readPath, setPathsPatch, parseTokenColor, type ResolvedValue } from "@canvas";

import { imagePaint, type DesignNode } from "../../core";
import { toBoolean, toNumber } from "./coerce";
import { formatValue } from "./format-value";
import type { DataBinding } from "./binding.types";
import type { BindingContext, BindingWrite } from "./plan-bindings.types";
import type { LookupResult } from "./scope.types";

/** `fills.<i>.image` / `strokes.<i>.image`: a paint's picture, data's own binding. */
const IMAGE_PATH = /^((?:fills|strokes)\.\d+)\.image$/;

const KEEP: BindingWrite = { value: null, image: null, emptyImage: false };

/** Whether a binding path is a paint's picture. */
export function isImageBinding(path: string): boolean {
  return IMAGE_PATH.test(path);
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === "string" && !value.trim());
}

/** A data value as the variable type a field takes, `null` when it doesn't fit. */
function resolvedValue(
  type: string,
  read: LookupResult,
  binding: DataBinding,
  locale: string,
): ResolvedValue | null {
  if (type === "number") {
    const n = toNumber(read.value, read.field?.type);
    return n === null ? null : { type: "number", number: n };
  }
  if (type === "boolean") {
    const b = toBoolean(read.value);
    return b === null ? null : { type: "boolean", boolean: b };
  }
  if (type === "color") {
    const color = typeof read.value === "string" ? parseTokenColor(read.value) : null;
    return color === null ? null : { type: "color", color };
  }
  if (type === "string") {
    return { type: "string", string: formatValue(read.value, read.field, binding.format, locale) };
  }
  return null;
}

/**
 * What one binding writes: for a paint's picture, the saved picture's asset among the pictures
 * of the source the value comes from (`null` from `images` keeps the current one); otherwise the value turned into the type the kind's
 * `BindableField` takes (a number coerced, a color parsed, a boolean read, a text formatted).
 * A field the kind doesn't offer, or a value that doesn't fit, is left alone.
 */
export function bindingWrite(
  el: DesignNode,
  path: string,
  binding: DataBinding,
  read: LookupResult | null,
  ctx: BindingContext,
): BindingWrite {
  const image = IMAGE_PATH.exec(path);
  if (image) {
    const value = read?.value;
    if (isEmpty(value) || typeof value === "object") return { ...KEEP, emptyImage: true };
    const source = read?.source;
    if (!source) return KEEP;
    const assetId = ctx.images(String(value), source);
    return assetId === null ? KEEP : { ...KEEP, image: { paint: image[1] as string, assetId } };
  }
  if (!read) return KEEP;
  const field = ctx.kinds
    .kindOf(el)
    .bindable(el)
    .find((f) => f.path === path);
  if (!field) return KEEP;
  return { ...KEEP, value: resolvedValue(field.type, read, binding, ctx.locale) };
}

/** The paint fields a picture sets (another paint becomes an image one, keeping its look). */
function imageFields(el: DesignNode, paintPath: string, assetId: string): Record<string, unknown> {
  const paint = readPath(el, paintPath) as { type?: unknown; opacity?: unknown; visible?: unknown };
  if (typeof paint !== "object" || paint === null) return {};
  if (paint.type === "image") return { [`${paintPath}.assetId`]: assetId };
  return {
    [paintPath]: {
      ...imagePaint(assetId),
      ...(typeof paint.opacity === "number" ? { opacity: paint.opacity } : {}),
      ...(typeof paint.visible === "boolean" ? { visible: paint.visible } : {}),
    },
  };
}

/** The stored values (paths → values) a write leaves in the layer, `null` when it writes none. */
export function writtenFields(
  el: DesignNode,
  path: string,
  write: BindingWrite,
  ctx: BindingContext,
): Record<string, unknown> | null {
  if (write.image) return imageFields(el, write.image.paint, write.image.assetId);
  if (write.value) return ctx.kinds.kindOf(el).bindValues(el, path, write.value);
  return null;
}

/** The patch a write makes, through the kind's `bindPatch` (a size resizes, a text lays out). */
export function writePatch(
  el: DesignNode,
  path: string,
  write: BindingWrite,
  ctx: BindingContext,
): Record<string, unknown> | null {
  if (write.image)
    return setPathsPatch(el, imageFields(el, write.image.paint, write.image.assetId));
  if (write.value)
    return ctx.kinds.kindOf(el).bindPatch(el, path, write.value) as Record<string, unknown> | null;
  return null;
}
