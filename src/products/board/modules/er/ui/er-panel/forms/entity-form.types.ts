import type {
  ErAggregateElement,
  ErConstraintElement,
  ErEntityElement,
  ErIsaElement,
  ErRelationElement,
} from "@board";

export interface EntityFormProps {
  entity: ErEntityElement;
}

export interface RelationFormProps {
  relation: ErRelationElement;
}

export interface IsaFormProps {
  isa: ErIsaElement;
}

export interface AggregateFormProps {
  aggregate: ErAggregateElement;
}

export interface ConstraintFormProps {
  constraint: ErConstraintElement;
}
