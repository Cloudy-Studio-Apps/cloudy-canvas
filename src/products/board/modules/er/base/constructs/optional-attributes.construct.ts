import { defineErConstruct } from "./define-er-construct";

/** Optional attributes (half-filled lollipops). */
export const OPTIONAL_ATTRIBUTES_CONSTRUCT = defineErConstruct({
  id: "optional-attributes",
  label: "Optional attributes",
  detect: (s) => s.attributes.filter((a) => a.optional).map((a) => a.id),
});
