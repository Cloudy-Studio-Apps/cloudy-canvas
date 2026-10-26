import type { GeneratedSpec } from "../styleguide.types";
import { SHEET_LOOK } from "./sheet-look";
import type { LabelLook, SpecExtra } from "./spec-builders.types";

/**
 * A frame laying out `children` in a row or a column, as big as they are, with no fill of its own
 * (`extra` may give one, a `gap`, `padding`, alignment or sizing).
 */
export function stack(
  key: string,
  direction: "horizontal" | "vertical",
  children: GeneratedSpec[],
  extra: SpecExtra = {},
): GeneratedSpec {
  const { gap, padding, align, counterAlign, wrap, counterGap, ...rest } = extra;
  return {
    key,
    args: {
      type: "frame",
      name: key.slice(key.lastIndexOf("/") + 1),
      fills: [],
      clipsContent: false,
      layout: {
        direction,
        gap: gap ?? SHEET_LOOK.gap,
        padding: padding ?? 0,
        align: align ?? "start",
        counterAlign: counterAlign ?? "start",
        wrap: wrap ?? false,
        counterGap: counterGap ?? gap ?? SHEET_LOOK.gap,
      },
      sizing: { h: "hug", v: "hug" },
      ...rest,
    },
    children,
  };
}

/** A rectangle, `w`×`h`. */
export function box(
  key: string,
  w: number,
  h: number,
  extra: SpecExtra = {},
  bindings?: Record<string, string>,
): GeneratedSpec {
  return {
    key,
    args: { type: "rectangle", name: "Swatch", w, h, ...extra },
    ...(bindings ? { bindings } : {}),
  };
}

/** A circle, `size` across. */
export function dot(
  key: string,
  size: number,
  extra: SpecExtra = {},
  bindings?: Record<string, string>,
): GeneratedSpec {
  return {
    key,
    args: { type: "ellipse", name: "Swatch", w: size, h: size, ...extra },
    ...(bindings ? { bindings } : {}),
  };
}

/** A text in the sheet's font: a label by default, `look` for titles and samples. */
export function label(
  key: string,
  text: string,
  look: LabelLook = {},
  extra: SpecExtra = {},
  bindings?: Record<string, string>,
): GeneratedSpec {
  return {
    key,
    args: {
      type: "text",
      name: text.slice(0, 40) || "Text",
      text: text || " ",
      fontFamily: look.font ?? SHEET_LOOK.font,
      fontSize: look.size ?? SHEET_LOOK.label,
      fontWeight: look.weight ?? "400",
      color: look.color ?? SHEET_LOOK.ink,
      ...(look.lineHeight !== undefined ? { lineHeight: look.lineHeight } : {}),
      ...(look.width !== undefined ? { w: look.width, autoResize: "height" } : {}),
      ...extra,
    },
    ...(bindings ? { bindings } : {}),
  };
}

/** A solid fill of a `#RRGGBB` or `#RRGGBBAA` color (its alpha as the paint's opacity). */
export function solidFill(color: string, opacity = 1): SpecExtra {
  const alpha = color.length === 9 ? parseInt(color.slice(7, 9), 16) / 255 : 1;
  return { fills: [{ type: "solid", color: color.slice(0, 7), opacity: opacity * alpha }] };
}

/** Every key of `specs` and their children with `prefix` in front, so sections never collide. */
export function prefixKeys(prefix: string, specs: readonly GeneratedSpec[]): GeneratedSpec[] {
  return specs.map((spec) => ({
    ...spec,
    key: `${prefix}${spec.key}`,
    ...(spec.children ? { children: prefixKeys(prefix, spec.children) } : {}),
  }));
}
