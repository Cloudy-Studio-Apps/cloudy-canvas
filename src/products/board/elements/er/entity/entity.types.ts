import type { ErElementBase } from "../base/er.types";

/** An ER (Chen notation) entity: a rectangle, doubled when weak. Its size comes from the name. */
export interface ErEntityElement extends ErElementBase {
  type: "er-entity";
  name: string;
  weak: boolean;
  color: string;
}
