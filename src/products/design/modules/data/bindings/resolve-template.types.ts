import type { TextNodeRun } from "../../text";

/** A template with its tokens filled. */
export interface ResolvedTemplate {
  text: string;
  runs: TextNodeRun[];
  /** Every token came out empty and nothing else but whitespace is left. */
  empty: boolean;
  /** Expressions the resolver didn't know. */
  missing: string[];
}
