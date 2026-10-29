import type { CodeRelation } from "../../model";

/** The properties a relation adds: on the foreign key's model and on the model it points at. */
export interface RelationProps {
  relation: CodeRelation;
  /** On `from.table`'s model: the related object (`user`), or the list for many to many. */
  from: string;
  /** On `to.table`'s model: the list (`orders`) or, for one to one, the object (`profile`). */
  to: string;
  /** Set when the two models have more than one relation, or it points at its own model. */
  name: string | null;
}
