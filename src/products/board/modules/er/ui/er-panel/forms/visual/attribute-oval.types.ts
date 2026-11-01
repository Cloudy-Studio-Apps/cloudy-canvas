import type { ErAttributeElement } from "../../../../attribute/attribute.types";

export interface AttributeOvalProps {
  attribute: Pick<ErAttributeElement, "key" | "multivalued" | "derived" | "optional">;
  /** The text inside; a sample when not given. */
  label?: string;
  className?: string;
}
