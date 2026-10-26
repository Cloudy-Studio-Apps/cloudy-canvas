import type { FigImportContext, FigNode, FigPaint } from "@canvas/figma";

import { RUN_STYLE_PREFIX, TEXT_STYLE_PATH } from "../../../modules";

/** Figma's bound fields (`variableConsumptionMap`) and the paths they are on our layers. */
const FIELDS: Record<string, string> = {
  STACK_SPACING: "layout.gap",
  STACK_COUNTER_SPACING: "layout.counterGap",
  STACK_PADDING_LEFT: "layout.padding.left",
  STACK_PADDING_TOP: "layout.padding.top",
  STACK_PADDING_RIGHT: "layout.padding.right",
  STACK_PADDING_BOTTOM: "layout.padding.bottom",
  CORNER_RADIUS: "cornerRadius",
  WIDTH: "w",
  HEIGHT: "h",
  OPACITY: "opacity",
  STROKE_WEIGHT: "strokeWeight",
  FONT_SIZE: "fontSize",
  FONT_FAMILY: "fontFamily",
  FONT_STYLE: "fontStyle",
  TEXT_DATA: "text",
  VISIBLE: "visible",
};
const CORNERS = [
  "RECTANGLE_TOP_LEFT_CORNER_RADIUS",
  "RECTANGLE_TOP_RIGHT_CORNER_RADIUS",
  "RECTANGLE_BOTTOM_LEFT_CORNER_RADIUS",
  "RECTANGLE_BOTTOM_RIGHT_CORNER_RADIUS",
];

/**
 * The colors of a converted paint stack bound to variables (`<field>.<i>.color`), `from` giving
 * each converted paint's index in Figma's stack (paints left out don't shift the others).
 */
export function figPaintBindings(
  paints: readonly FigPaint[] | undefined,
  from: readonly number[],
  field: string,
  ctx: FigImportContext,
): Record<string, string> {
  const bindings: Record<string, string> = {};
  from.forEach((source, i) => {
    const data = paints?.[source]?.colorVar;
    if (data?.dataType !== "ALIAS") return;
    const id = ctx.tokenId(data.value?.alias?.guid);
    if (id) bindings[`${field}.${i}.color`] = id;
  });
  return bindings;
}

/**
 * A layer's other bindings: the fields Figma binds to variables (the four corner radii as our
 * one radius when they share a variable), and the shared styles it uses (text, color, effect),
 * when the file holds them. Fields we don't have are counted.
 */
export function figLayerBindings(node: FigNode, ctx: FigImportContext): Record<string, string> {
  const bindings: Record<string, string> = {};
  const corners = new Map<string, string>();
  for (const entry of node.variableConsumptionMap?.entries ?? []) {
    const data = entry.variableData;
    if (data?.dataType !== "ALIAS" || !entry.variableField) continue;
    const id = ctx.tokenId(data.value?.alias?.guid);
    if (!id) continue;
    if (CORNERS.includes(entry.variableField)) corners.set(entry.variableField, id);
    else if (FIELDS[entry.variableField]) bindings[FIELDS[entry.variableField] as string] = id;
    else ctx.warnings.add("fields bound to variables we can't bind kept their values");
  }
  const radii = new Set(corners.values());
  if (corners.size === CORNERS.length && radii.size === 1)
    bindings.cornerRadius = [...radii][0] as string;
  else if (corners.size > 0)
    ctx.warnings.add("corner radii bound to different variables kept their values");

  const text = ctx.styleId(node.styleIdForText);
  if (text && node.type === "TEXT") bindings[TEXT_STYLE_PATH] = text;
  const fill = ctx.styleId(node.styleIdForFill);
  if (fill) bindings.fills = fill;
  const stroke = ctx.styleId(node.styleIdForStrokeFill);
  if (stroke) bindings.strokes = stroke;
  const effect = ctx.styleId(node.styleIdForEffect);
  if (effect) bindings.effects = effect;
  return bindings;
}

/** A text's ranges styled with a text style: the binding each style id keeps. */
export function figRunBindings(
  runs: readonly { style: { textStyle?: string } }[],
): Record<string, string> {
  const bindings: Record<string, string> = {};
  for (const run of runs) {
    const id = run.style.textStyle;
    if (id) bindings[`${RUN_STYLE_PREFIX}${id}`] = id;
  }
  return bindings;
}
