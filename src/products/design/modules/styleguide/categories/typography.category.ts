import { TEXT_STYLE } from "../../text";
import { styleGroups } from "../sheet";
import type { StyleguideCategory } from "../styleguide.types";
import { isFontVariable, variables } from "./category-tokens";
import { t } from "../styleguide.i18n";

/** Text styles, then the text variables that name fonts and faces. */
export const typographyCategory: StyleguideCategory = {
  id: "typography",
  label: t("categories.typography"),
  order: 30,
  defaultTemplate: "typography.scale",
  groups: (store) => [
    ...styleGroups(store.styles(TEXT_STYLE)),
    ...variables(store, isFontVariable),
  ],
};
