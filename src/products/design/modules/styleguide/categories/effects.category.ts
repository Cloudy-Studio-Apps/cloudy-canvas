import { EFFECT_STYLE } from "../../core";
import { styleGroups } from "../sheet";
import type { StyleguideCategory } from "../styleguide.types";
import { t } from "../styleguide.i18n";

/** Effect styles. */
export const effectsCategory: StyleguideCategory = {
  id: "effects",
  label: t("categories.effects"),
  order: 60,
  defaultTemplate: "effects.cards",
  groups: (store) => styleGroups(store.styles(EFFECT_STYLE)),
};
