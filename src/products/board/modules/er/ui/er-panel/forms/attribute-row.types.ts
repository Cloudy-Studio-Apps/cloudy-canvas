import type { ErAttributeElement } from "@board";

export interface AttributeRowProps {
  attribute: ErAttributeElement;
  /** Parts of this attribute, when it's composite (and their parts, recursively). */
  partsOf: ReadonlyMap<string, ErAttributeElement[]>;
  first: boolean;
  last: boolean;
  depth: number;
}

export interface AttributeListProps {
  ownerId: string;
  title?: string;
}
