import { defineErConstruct } from "./define-er-construct";

/** Alternate (candidate) keys. */
export const ALTERNATE_KEYS_CONSTRUCT = defineErConstruct({
  id: "alternate-keys",
  label: "Alternate keys",
  detect: (s) => s.attributes.filter((a) => a.key === "alternate").map((a) => a.id),
});
