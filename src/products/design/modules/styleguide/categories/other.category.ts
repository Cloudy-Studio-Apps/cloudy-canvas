import { numberPurposeOf } from "../tokens";
import type { StyleguideCategory } from "../styleguide.types";
import { isFontVariable, variables } from "./category-tokens";
import { t } from "../styleguide.i18n";

/** What no other category takes: other texts, booleans and numbers (font sizes, sizes). */
export const otherCategory: StyleguideCategory = {
  id: "other",
  label: t("categories.other"),
  order: 100,
  defaultTemplate: "other.table",
  groups: (store) =>
    variables(store, (v) => {
      if (v.type === "string") return !isFontVariable(v);
      if (v.type === "boolean") return true;
      if (v.type !== "number") return false;
      const purpose = numberPurposeOf(v);
      return purpose === "font" || purpose === "other";
    }),
};
