import type { BindableField, TokenScope } from "@canvas";

import type { DesignNode } from "./design-node.types";
import type { Paint } from "./paint.types";

/** The numeric fields of an effect a variable can drive, whatever its type. */
const EFFECT_NUMBERS = ["x", "y", "blur", "spread", "radius"] as const;
const SIDES = ["top", "right", "bottom", "left"] as const;
const LIMITS = ["minW", "maxW", "minH", "maxH"] as const;

/** A paint stack's colors: each solid paint's, each gradient stop's. */
export function paintBindable(
  paints: readonly Paint[],
  field: "fills" | "strokes",
  scopes: TokenScope[],
): BindableField[] {
  const fields: BindableField[] = [];
  const name = field === "fills" ? "Fill" : "Stroke";
  for (const [i, paint] of paints.entries()) {
    if (paint.type === "solid") {
      fields.push({
        path: `${field}.${i}.color`,
        type: "color",
        scopes,
        label: `${name} ${i + 1}`,
      });
    } else if ("stops" in paint) {
      for (const j of paint.stops.keys()) {
        fields.push({
          path: `${field}.${i}.stops.${j}.color`,
          type: "color",
          scopes,
          label: `${name} ${i + 1} stop ${j + 1}`,
        });
      }
    }
  }
  return fields;
}

/** An effect stack's colors and numbers, read by the fields effects have (not by their types). */
export function effectBindable(node: DesignNode): BindableField[] {
  const fields: BindableField[] = [];
  for (const [i, effect] of node.effects.entries()) {
    const values = effect as unknown as Record<string, unknown>;
    const label = `Effect ${i + 1}`;
    if (typeof values.color === "string" && typeof values.opacity === "number") {
      fields.push({ path: `effects.${i}.color`, type: "color", scopes: ["effect-color"], label });
    }
    for (const key of EFFECT_NUMBERS) {
      if (typeof values[key] !== "number") continue;
      fields.push({
        path: `effects.${i}.${key}`,
        type: "number",
        scopes: ["effect-value"],
        label: `${label} ${key}`,
      });
    }
  }
  return fields;
}

/** A number field. */
export function numberField(path: string, scope: TokenScope, label: string): BindableField {
  return { path, type: "number", scopes: [scope], label };
}

/** A text field (content, a font's name). */
export function stringField(path: string, scope: TokenScope, label: string): BindableField {
  return { path, type: "string", scopes: [scope], label };
}

/** A true/false field; booleans aren't scoped (as in Figma). */
export function booleanField(path: string, label: string): BindableField {
  return { path, type: "boolean", scopes: [], label };
}

/** Each side's stroke weight, when the node keeps them apart. */
export function strokeSideFields(node: DesignNode): BindableField[] {
  if (!node.strokeWeights) return [];
  return SIDES.map((side) =>
    numberField(`strokeWeights.${side}`, "stroke-weight", `Stroke ${side}`),
  );
}

/** The size limits the node has. */
export function sizeLimitFields(node: DesignNode): BindableField[] {
  const limits = node.sizeLimits ?? {};
  return LIMITS.filter((key) => typeof limits[key] === "number").map((key) =>
    numberField(`sizeLimits.${key}`, "width-height", key),
  );
}

/** An auto layout's gaps and padding. */
export function layoutFields(): BindableField[] {
  return [
    numberField("layout.gap", "gap", "Gap"),
    numberField("layout.counterGap", "gap", "Line gap"),
    ...SIDES.map((side) => numberField(`layout.padding.${side}`, "padding", `Padding ${side}`)),
  ];
}
