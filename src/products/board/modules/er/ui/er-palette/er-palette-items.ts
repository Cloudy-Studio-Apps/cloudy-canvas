import type { ErPaletteItem } from "./er-palette.types";
import { t } from "../../er.i18n";

/** The palette's buttons, top to bottom, with what their tooltips say. */
export const ER_PALETTE_ITEMS: readonly ErPaletteItem[] = [
  { id: "entity", label: t("palette.entity.label"), description: t("palette.entity.description") },
  {
    id: "weak-entity",
    label: t("palette.weakEntity.label"),
    description: t("palette.weakEntity.description"),
  },
  {
    id: "relation",
    label: t("palette.relation.label"),
    description: t("palette.relation.description"),
  },
  {
    id: "associative",
    label: t("palette.associative.label"),
    description: t("palette.associative.description"),
  },
  {
    id: "attribute",
    label: t("palette.attribute.label"),
    description: t("palette.attribute.description"),
  },
  {
    id: "key-attribute",
    label: t("palette.keyAttribute.label"),
    description: t("palette.keyAttribute.description"),
  },
  { id: "isa", label: t("palette.isa.label"), description: t("palette.isa.description") },
  {
    id: "union",
    label: t("palette.union.label"),
    description: t("palette.union.description"),
  },
  {
    id: "aggregate",
    label: t("palette.aggregate.label"),
    description: t("palette.aggregate.description"),
  },
  {
    id: "constraint",
    label: t("palette.constraint.label"),
    description: t("palette.constraint.description"),
  },
];
