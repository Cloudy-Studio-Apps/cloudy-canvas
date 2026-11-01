import type { ErAttributeElement } from "../../../attribute/attribute.types";

export interface AttributeRowProps {
  attribute: ErAttributeElement;
}

export interface AttributeListProps {
  ownerId: string;
  title?: string;
  /** The add button's text. */
  addLabel?: string;
  /** Why the list can't grow; empty when it can. */
  blocked?: string;
}
