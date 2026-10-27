import type { StyleRecord, TokenStore, VariableRecord } from "@canvas";

import type { NumberKind } from "./board-model.types";
import { t } from "../../variables.i18n";

/** The kinds of number group, each tied to the fields it's for (its scopes). */
export const NUMBER_KINDS: readonly NumberKind[] = [
  {
    id: "spacing",
    label: t("kinds.spacing"),
    icon: "↔",
    scopes: ["gap", "padding"],
    first: 8,
    group: "spacing",
  },
  {
    id: "radius",
    label: t("kinds.radius"),
    icon: "◜",
    scopes: ["corner-radius"],
    first: 4,
    group: "radius",
  },
  {
    id: "font",
    label: t("kinds.font"),
    icon: "Aa",
    scopes: ["font-size"],
    first: 16,
    group: "type",
  },
  {
    id: "opacity",
    label: t("kinds.opacity"),
    icon: "◐",
    scopes: ["opacity"],
    first: 50,
    group: "opacity",
  },
  {
    id: "stroke",
    label: t("kinds.stroke"),
    icon: "━",
    scopes: ["stroke-weight"],
    first: 1,
    group: "stroke",
  },
  { id: "other", label: t("kinds.other"), icon: "#", scopes: [], first: 0, group: "numbers" },
];

/** A number variable's kind, read from its scopes. */
export function numberKindOf(variable: VariableRecord): NumberKind {
  const scopes = new Set(variable.scopes);
  return (
    NUMBER_KINDS.find((kind) => kind.scopes.length > 0 && kind.scopes.some((s) => scopes.has(s))) ??
    (NUMBER_KINDS.at(-1) as NumberKind)
  );
}

/** A non-color variable's glyph: its number kind's, "T" for texts, "✓" for booleans. */
export function typeGlyph(variable: VariableRecord): string {
  if (variable.type === "string") return "T";
  if (variable.type === "boolean") return "✓";
  return numberKindOf(variable).icon;
}

/**
 * How a group is described under its title: "shades of 500" when one generator made it (an extra
 * hand-made color allowed), else "colors" or its number kind.
 */
export function groupLabel(store: TokenStore, items: readonly VariableRecord[]): string {
  const first = items[0];
  if (!first) return "";
  if (first.type === "number") return numberKindOf(first).label.toLowerCase();
  if (first.type === "string") return t("groupLabel.texts");
  if (first.type === "boolean") return t("groupLabel.booleans");
  const ids = new Set(items.map((v) => v.generatorId).filter(Boolean));
  const generator = ids.size === 1 ? store.generator([...ids][0] ?? "") : undefined;
  if (generator) {
    const linked = items.filter(
      (v) => v.generatorId === generator.id || v.id === generator.baseVar,
    );
    if (linked.length >= items.length - 1) {
      const base = generator.baseVar ? store.variable(generator.baseVar) : undefined;
      return t("groupLabel.shades", { name: base ? leaf(base) : generator.baseColor.slice(0, 7) });
    }
  }
  return t("groupLabel.colors");
}

function leaf(record: VariableRecord | StyleRecord): string {
  return record.name.slice(record.name.lastIndexOf("/") + 1);
}
