import { defineErConstruct } from "./define-er-construct";

/** Union types (categories). */
export const UNIONS_CONSTRUCT = defineErConstruct({
  id: "unions",
  label: "Union types",
  detect: (s) => s.unions.map((x) => x.id),
});
