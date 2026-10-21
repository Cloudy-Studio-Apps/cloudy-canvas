import type {
  ErAggregateShape,
  ErConstraintShape,
  ErEntityShape,
  ErIsaShape,
  ErRelationShape,
} from "@engine";

export interface EntityFormProps {
  entity: ErEntityShape;
}

export interface RelationFormProps {
  relation: ErRelationShape;
}

export interface IsaFormProps {
  isa: ErIsaShape;
}

export interface AggregateFormProps {
  aggregate: ErAggregateShape;
}

export interface ConstraintFormProps {
  constraint: ErConstraintShape;
}
