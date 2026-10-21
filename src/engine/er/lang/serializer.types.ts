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

/** A span of text, as character offsets (`to` is exclusive). */
export interface TextRange {
  from: number;
  to: number;
}

/** The ER text and where each top-level shape (not attributes) is written in it. */
export interface ErText {
  text: string;
  ranges: Map<string, TextRange>;
}
