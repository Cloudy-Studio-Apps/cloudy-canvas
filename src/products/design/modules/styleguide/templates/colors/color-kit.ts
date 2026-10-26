import type { VariableRecord } from "@canvas";

import { box, label, SHEET_LOOK, solidFill } from "../../sheet";
import type {
  GeneratedSpec,
  SheetBuildContext,
  TemplateOptions,
  TemplateOptionSpec,
} from "../../styleguide.types";
import { colorOf, fontOf, leafName } from "../template-kit";
import { hexOf, hslOf, rgbOf } from "./color-text";

/** The options every color template shares. */
export const COLOR_OPTIONS: readonly TemplateOptionSpec[] = [
  { id: "showHex", label: "Hex", type: "boolean", default: true },
  { id: "showRgb", label: "RGB", type: "boolean", default: false },
  { id: "showHsl", label: "HSL", type: "boolean", default: false },
  { id: "showCode", label: "Code name", type: "boolean", default: false },
  { id: "showDescription", label: "Description", type: "boolean", default: false },
  { id: "swatch", label: "Swatch size", type: "number", default: 96, min: 32, max: 240, step: 8 },
  { id: "font", label: "Label font", type: "font", default: SHEET_LOOK.font },
];

/** The columns option of the grid-like color templates. */
export const COLUMNS_OPTION: TemplateOptionSpec = {
  id: "columns",
  label: "Columns",
  type: "number",
  default: 6,
  min: 1,
  max: 12,
};

/** The swatch size the options pick. */
export function swatchSize(options: TemplateOptions): number {
  return typeof options.swatch === "number" ? options.swatch : 96;
}

/** A variable's code name: its first platform's. */
function codeName(variable: VariableRecord): string {
  return Object.values(variable.codeSyntax).find((name) => !!name) ?? "";
}

/** The values the options ask for (hex, rgb, hsl, code name, description), in that order. */
export function colorValues(
  variable: VariableRecord,
  options: TemplateOptions,
  context: SheetBuildContext,
): string[] {
  const color = colorOf(context, variable.id);
  return [
    options.showHex ? hexOf(color) : "",
    options.showRgb ? rgbOf(color) : "",
    options.showHsl ? hslOf(color) : "",
    options.showCode ? codeName(variable) : "",
    options.showDescription ? variable.description : "",
  ].filter((text) => text !== "");
}

/** A swatch of a color variable, bound to it so it follows its value. */
export function colorSwatch(
  key: string,
  variable: VariableRecord,
  context: SheetBuildContext,
  w: number,
  h: number,
  extra: Record<string, unknown> = {},
): GeneratedSpec {
  return box(
    key,
    w,
    h,
    {
      name: leafName(variable),
      ...solidFill(colorOf(context, variable.id)),
      // A hairline, so white and near-white swatches still show on the white sheet.
      strokes: [{ type: "solid", color: SHEET_LOOK.line, opacity: 1 }],
      strokeWeight: 1,
      strokeAlign: "inside",
      ...extra,
    },
    { "fills.0.color": variable.id },
  );
}

/** A variable's name and its values, under its swatch. */
export function colorCaption(
  variable: VariableRecord,
  options: TemplateOptions,
  context: SheetBuildContext,
  width?: number,
): GeneratedSpec[] {
  const font = fontOf(options);
  return [
    label("name", leafName(variable), { font, weight: "600", width }),
    ...colorValues(variable, options, context).map((text, i) =>
      label(`value:${i}`, text, { font, color: SHEET_LOOK.muted, width }),
    ),
  ];
}
