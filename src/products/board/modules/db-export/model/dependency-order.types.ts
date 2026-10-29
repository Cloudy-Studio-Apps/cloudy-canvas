import type { CodeRelation, CodeTable } from "./code-schema.types";

export interface DependencyOrder {
  order: CodeTable[];
  /** Foreign keys that close a cycle, to write after every table. */
  deferred: CodeRelation[];
}
