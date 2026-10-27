import type { StyleRecord } from "@canvas";

import type { DesignNode, NodeEffect } from "../node/design-node.types";
import type { EffectStyleValue } from "./effect-style.types";
import { t } from "../core.i18n";

function isEffect(value: unknown): value is NodeEffect {
  if (typeof value !== "object" || value === null) return false;
  const effect = value as Record<string, unknown>;
  return typeof effect.id === "string" && typeof effect.type === "string";
}

/** A stored effect style's stack, or `null` when it has none. */
export function readEffectStyle(value: Readonly<Record<string, unknown>>): EffectStyleValue | null {
  if (!Array.isArray(value.effects)) return null;
  return { effects: value.effects.filter(isEffect) };
}

/** A node's effects as an effect style's value. */
export function effectStyleOfNode(node: DesignNode): EffectStyleValue {
  return { effects: structuredClone(node.effects) };
}

/** "Drop shadow", or "3 effects". */
export function effectStyleSummary(style: StyleRecord): string {
  const effects = readEffectStyle(style.value)?.effects ?? [];
  const [only] = effects;
  if (effects.length !== 1 || !only) {
    return effects.length === 0
      ? t("styles.empty")
      : t("styles.effects", { count: effects.length });
  }
  const words = only.type.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
