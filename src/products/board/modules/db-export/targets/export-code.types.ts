import type { CodeOptionValue } from "./code-target.types";

/** What to export: which tables, how, and with which version and options of the target. */
export interface ExportCodeRequest {
  /** Table and enum ids to export (project mode); omitted for the whole schema. */
  ids?: readonly string[];
  /** Single mode: the id of the one table to write. */
  table?: string;
  /** A profile id of the target; omitted for its newest. */
  profile?: string;
  /** The target's options; missing ones take their defaults. */
  options?: Readonly<Record<string, CodeOptionValue>>;
  now: Date;
}
