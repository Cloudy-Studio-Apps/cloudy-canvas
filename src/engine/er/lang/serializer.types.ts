import type { ErAttributeShape, ErEntityShape, ErRelationShape } from "../../document";

/** Every ER shape on the board, by kind. */
export interface ErShapes {
  entities: ErEntityShape[];
  relations: ErRelationShape[];
  attributes: ErAttributeShape[];
}
