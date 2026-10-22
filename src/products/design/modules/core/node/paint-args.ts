import { fraction } from "./number-args";
import type { ImagePaint, Paint, SolidPaint } from "./paint.types";

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const NO_PAINT = new Set(["transparent", "none"]);
const SCALE_MODES: readonly ImagePaint["scaleMode"][] = ["fill", "fit"];

/** A `#rgb` or `#rrggbb` color as `#RRGGBB`; throws naming `key` otherwise. */
export function hexColor(value: unknown, key: string): string {
  if (typeof value !== "string" || !HEX.test(value)) {
    throw new Error(`"${key}" must be a hex color like #1E88E5, got ${JSON.stringify(value)}.`);
  }
  const hex = value.length === 4 ? value.replace(/[0-9a-f]/gi, (c) => c + c) : value;
  return hex.toUpperCase();
}

/** The paints of a shorthand color: one solid paint, or none for "transparent" / "none". */
export function colorPaints(value: string, key: string): Paint[] {
  if (NO_PAINT.has(value)) return [];
  return [{ type: "solid", color: hexColor(value, key), opacity: 1, visible: true }];
}

/**
 * Paints given in full, bottom to top: `{ type: "solid", color, opacity?, visible? }` or
 * `{ type: "image", assetId, scaleMode?, opacity?, visible? }` (only when `images`).
 */
export function readPaints(value: unknown, key: string, images: boolean): Paint[] {
  if (!Array.isArray(value)) throw new Error(`"${key}" must be an array of paints.`);
  return value.map((item, i) => readPaint(item, `${key}[${i}]`, images));
}

function readPaint(item: unknown, key: string, images: boolean): Paint {
  if (typeof item !== "object" || item === null) throw new Error(`"${key}" must be a paint.`);
  const paint = item as Record<string, unknown>;
  const opacity = paint.opacity === undefined ? 1 : fraction(paint.opacity, `${key}.opacity`);
  if (paint.visible !== undefined && typeof paint.visible !== "boolean") {
    throw new Error(`"${key}.visible" must be true or false.`);
  }
  const visible = paint.visible ?? true;
  if (paint.type === "solid") {
    const color = hexColor(paint.color, `${key}.color`);
    return { type: "solid", color, opacity, visible } satisfies SolidPaint;
  }
  if (paint.type === "image") {
    if (!images) throw new Error(`"${key}" can't be an image here.`);
    if (typeof paint.assetId !== "string" || paint.assetId === "") {
      throw new Error(`"${key}.assetId" must be the asset id of an image (see add_image).`);
    }
    const scaleMode = paint.scaleMode ?? "fill";
    if (!SCALE_MODES.includes(scaleMode as ImagePaint["scaleMode"])) {
      throw new Error(`"${key}.scaleMode" must be one of: ${SCALE_MODES.join(", ")}.`);
    }
    return {
      type: "image",
      assetId: paint.assetId,
      scaleMode: scaleMode as ImagePaint["scaleMode"],
      opacity,
      visible,
    };
  }
  throw new Error(`"${key}.type" must be solid${images ? " or image" : ""}.`);
}
