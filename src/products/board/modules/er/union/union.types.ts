import type { ErElementBase } from "../base/er.types";

/**
 * A union type (Elmasri's category): an entity (`categoryId`) whose instances are each one of its
 * superclasses' (`superclassIds`, two or more), drawn as a circle with a "U" between them.
 */
export interface ErUnionElement extends ErElementBase {
  type: "er-union";
  categoryId: string;
  superclassIds: string[];
}
