import { HIERARCHIES_CONSTRUCT } from "./hierarchies.construct";
import { AGGREGATIONS_CONSTRUCT } from "./aggregations.construct";
import { CONSTRAINTS_CONSTRUCT } from "./constraints.construct";
import { UNIONS_CONSTRUCT } from "./unions.construct";
import { WEAK_ENTITIES_CONSTRUCT } from "./weak-entities.construct";
import { ASSOCIATIVE_ENTITIES_CONSTRUCT } from "./associative-entities.construct";
import { IDENTIFYING_RELATIONS_CONSTRUCT } from "./identifying-relations.construct";
import { DEPENDENCY_MARKS_CONSTRUCT } from "./dependency-marks.construct";
import { NARY_RELATIONS_CONSTRUCT } from "./nary-relations.construct";
import { SELF_RELATIONS_CONSTRUCT } from "./self-relations.construct";
import { RELATION_ATTRIBUTES_CONSTRUCT } from "./relation-attributes.construct";
import { MULTIVALUED_ATTRIBUTES_CONSTRUCT } from "./multivalued-attributes.construct";
import { DERIVED_ATTRIBUTES_CONSTRUCT } from "./derived-attributes.construct";
import { COMPOSITE_ATTRIBUTES_CONSTRUCT } from "./composite-attributes.construct";
import { ALTERNATE_KEYS_CONSTRUCT } from "./alternate-keys.construct";
import { OPTIONAL_ATTRIBUTES_CONSTRUCT } from "./optional-attributes.construct";
import { JOIN_ATTRIBUTES_CONSTRUCT } from "./join-attributes.construct";
import type { ErConstructDefinition } from "./er-construct.types";

/** The constructs the er module contributes (standards forbid them by id). */
export const BUILT_IN_ER_CONSTRUCTS: readonly ErConstructDefinition[] = [
  HIERARCHIES_CONSTRUCT,
  AGGREGATIONS_CONSTRUCT,
  CONSTRAINTS_CONSTRUCT,
  UNIONS_CONSTRUCT,
  WEAK_ENTITIES_CONSTRUCT,
  ASSOCIATIVE_ENTITIES_CONSTRUCT,
  IDENTIFYING_RELATIONS_CONSTRUCT,
  DEPENDENCY_MARKS_CONSTRUCT,
  NARY_RELATIONS_CONSTRUCT,
  SELF_RELATIONS_CONSTRUCT,
  RELATION_ATTRIBUTES_CONSTRUCT,
  MULTIVALUED_ATTRIBUTES_CONSTRUCT,
  DERIVED_ATTRIBUTES_CONSTRUCT,
  COMPOSITE_ATTRIBUTES_CONSTRUCT,
  ALTERNATE_KEYS_CONSTRUCT,
  OPTIONAL_ATTRIBUTES_CONSTRUCT,
  JOIN_ATTRIBUTES_CONSTRUCT,
];
