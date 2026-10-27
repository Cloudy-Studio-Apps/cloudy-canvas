import { defineErConstruct } from "./define-er-construct";
import { t } from "../../er.i18n";

/** Alternate (candidate) keys. */
export const ALTERNATE_KEYS_CONSTRUCT = defineErConstruct({
  id: "alternate-keys",
  label: t("constructs.alternate-keys"),
  detect: (s) => s.attributes.filter((a) => a.key === "alternate").map((a) => a.id),
});
