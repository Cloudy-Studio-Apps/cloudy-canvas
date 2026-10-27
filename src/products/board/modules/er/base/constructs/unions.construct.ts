import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Union types (categories). */
export const UNIONS_CONSTRUCT = defineErConstruct({
  id: "unions",
  label: t("constructs.unions"),
  detect: (s) => s.unions.map((x) => x.id),
});
