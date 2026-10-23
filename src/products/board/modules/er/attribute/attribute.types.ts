import type { ErElementBase } from "../base/er.types";

/** Not a key, the key, a weak entity's partial key, or an alternate (candidate) key. */
export type ErAttributeKey = "none" | "pk" | "partial" | "alternate";

/** Chen ellipses, or small "lollipop" circles on sticks. */
export type ErAttributeLook = "ellipse" | "lollipop";

/**
 * An ER attribute, linked to its owner: an entity, a relation, a composite attribute, a hierarchy
 * (its discriminator) or an aggregation.
 */
export interface ErAttributeElement extends ErElementBase {
  type: "er-attribute";
  ownerId: string;
  name: string;
  key: ErAttributeKey;
  /** Drawn as a double ellipse. */
  multivalued: boolean;
  /** Drawn dashed. */
  derived: boolean;
  /** Drawn half-filled in the lollipop look. */
  optional: boolean;
  look: ErAttributeLook;
  /** Position among the owner's attributes, so the text keeps their order. */
  order: number;
}
