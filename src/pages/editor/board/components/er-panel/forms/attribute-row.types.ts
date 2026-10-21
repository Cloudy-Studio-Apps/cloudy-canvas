import type { ErAttributeShape } from "@engine";

export interface AttributeRowProps {
  attribute: ErAttributeShape;
  /** Parts of this attribute, when it's composite (and their parts, recursively). */
  partsOf: ReadonlyMap<string, ErAttributeShape[]>;
  first: boolean;
  last: boolean;
  depth: number;
}

export interface AttributeListProps {
  ownerId: string;
  title?: string;
}
