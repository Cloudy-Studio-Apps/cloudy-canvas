import type { CodeEnum, CodeRelation, CodeTable } from "../../model";
import type { CodeWarning } from "../warnings.types";

/** What a column line needs besides the column. */
export interface BlueprintContext {
  table: CodeTable;
  enums: readonly CodeEnum[];
  /** The foreign key this column holds, written inline (`constrained`), if any. */
  relation: CodeRelation | undefined;
  /** It holds a foreign key added in a later migration: written as `foreignId` without it. */
  deferred: boolean;
  warnings: CodeWarning[];
  /** Set when a default needs `DB::raw`. */
  usesDb: { value: boolean };
}
