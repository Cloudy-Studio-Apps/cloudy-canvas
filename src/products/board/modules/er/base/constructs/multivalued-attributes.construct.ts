import { defineErConstruct } from "./define-er-construct";

/** Multivalued attributes (double ellipses). */
export const MULTIVALUED_ATTRIBUTES_CONSTRUCT = defineErConstruct({
  id: "multivalued-attributes",
  label: "Multivalued attributes",
  detect: (s) => s.attributes.filter((a) => a.multivalued).map((a) => a.id),
});
