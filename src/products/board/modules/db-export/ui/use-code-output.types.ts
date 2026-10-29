import type { CodeOptionValue, CodeTargetDefinition } from "../targets";

export interface CodeOutputInput {
  target: CodeTargetDefinition;
  profile: string;
  options: Readonly<Record<string, CodeOptionValue>>;
  /** Project mode: the ids to export, `[]` for the whole schema. */
  ids: readonly string[];
  /** Single mode: the one table's id. */
  table: string | null;
  now: Date;
}
