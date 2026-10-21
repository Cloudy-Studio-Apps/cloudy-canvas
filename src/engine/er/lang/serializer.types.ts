import type {
  ErAggregateShape,
  ErAttributeShape,
  ErConstraintShape,
  ErEntityShape,
  ErIsaShape,
  ErRelationShape,
} from "../../document";

/** Every ER shape on the board, by kind. */
export interface ErShapes {
  entities: ErEntityShape[];
  relations: ErRelationShape[];
  attributes: ErAttributeShape[];
  isas: ErIsaShape[];
  aggregates: ErAggregateShape[];
  constraints: ErConstraintShape[];
}
