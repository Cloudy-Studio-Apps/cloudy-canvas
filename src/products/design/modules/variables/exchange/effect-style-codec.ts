import {
  dtcgColor,
  dtcgDimension,
  joinTokenColor,
  readDimension,
  readDtcgColor,
  referenceOf,
  splitTokenColor,
  type DtcgStyleCodec,
} from "@canvas";

import { EFFECT_STYLE, readEffectStyle } from "../../core";
import { createEffect } from "../../effects";
import type { ShadowEffect as Shadow } from "./exchange.types";

const NUMBERS = [
  ["offsetX", "x"],
  ["offsetY", "y"],
  ["blur", "blur"],
  ["spread", "spread"],
] as const;

/** Effect styles made only of shadows as DTCG `shadow` (one, or a list bottom to top). */
export const EFFECT_STYLE_CODEC: DtcgStyleCodec = {
  styleType: EFFECT_STYLE,
  dtcgType: "shadow",
  group: "Effects",
  write(style, ref) {
    const { effects = [] } = readEffectStyle(style.value) ?? {};
    const shadows = effects.filter(
      (e): e is Shadow => e.type === "drop-shadow" || e.type === "inner-shadow",
    );
    if (shadows.length === 0 || shadows.length !== effects.length) return null;
    const bound = (path: string) => {
      const id = style.bindings?.[path];
      return id ? ref(id) : null;
    };
    const values = shadows.map((shadow, i) => ({
      color: bound(`effects.${i}.color`) ?? dtcgColor(joinTokenColor(shadow.color, shadow.opacity)),
      ...Object.fromEntries(
        NUMBERS.map(([dtcg, own]) => [
          dtcg,
          bound(`effects.${i}.${own}`) ?? dtcgDimension(shadow[own]),
        ]),
      ),
      inset: shadow.type === "inner-shadow",
    }));
    return values.length === 1 ? values[0] : values;
  },
  read(raw, refs) {
    const list = Array.isArray(raw) ? raw : [raw];
    const bindings: Record<string, string> = {};
    const effects: Shadow[] = [];
    for (const [i, item] of list.entries()) {
      if (typeof item !== "object" || item === null) return null;
      const fields = item as Record<string, unknown>;
      const shadow = createEffect(fields.inset === true ? "inner-shadow" : "drop-shadow");
      // A reference binds the part and gives its value.
      const field = (key: string, path: string): unknown => {
        const reference = referenceOf(fields[key]);
        if (reference === null) return fields[key];
        const id = refs.id(reference);
        if (id) bindings[path] = id;
        return refs.value(reference);
      };
      const color = readDtcgColor(field("color", `effects.${i}.color`));
      if (color) {
        const { hex, alpha } = splitTokenColor(color);
        Object.assign(shadow, { color: hex, opacity: alpha });
      }
      for (const [dtcg, own] of NUMBERS) {
        const n = readDimension(field(dtcg, `effects.${i}.${own}`));
        if (n !== null) shadow[own] = n;
      }
      effects.push(shadow);
    }
    return { value: { effects }, bindings };
  },
};
