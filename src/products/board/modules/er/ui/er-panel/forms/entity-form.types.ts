import type { ErUnionElement } from "../../../union/union.types";
import type { ErAggregateElement } from "../../../aggregate/aggregate.types";
import type { ErConstraintElement } from "../../../constraint/constraint.types";
import type { ErEntityElement } from "../../../entity/entity.types";
import type { ErIsaElement } from "../../../isa/isa.types";
import type { ErRelationElement } from "../../../relation/relation.types";

export interface EntityFormProps {
  entity: ErEntityElement;
}

export interface RelationFormProps {
  relation: ErRelationElement;
}

export interface IsaFormProps {
  isa: ErIsaElement;
}

export interface UnionFormProps {
  union: ErUnionElement;
}

export interface AggregateFormProps {
  aggregate: ErAggregateElement;
}

export interface ConstraintFormProps {
  constraint: ErConstraintElement;
}
