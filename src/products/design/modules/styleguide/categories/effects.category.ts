import { EFFECT_STYLE } from "../../core";
import { styleGroups } from "../sheet";
import type { StyleguideCategory } from "../styleguide.types";

/** Effect styles. */
export const effectsCategory: StyleguideCategory = {
  id: "effects",
  label: "Effects",
  order: 60,
  defaultTemplate: "effects.cards",
  groups: (store) => styleGroups(store.styles(EFFECT_STYLE)),
};
