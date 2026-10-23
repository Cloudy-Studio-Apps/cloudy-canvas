import { defineErConstruct } from "./define-er-construct";

/** Derived attributes (dashed ellipses). */
export const DERIVED_ATTRIBUTES_CONSTRUCT = defineErConstruct({
  id: "derived-attributes",
  label: "Derived attributes",
  detect: (s) => s.attributes.filter((a) => a.derived).map((a) => a.id),
});
