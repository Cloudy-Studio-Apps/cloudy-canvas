import type { TextNodeRun } from "../../text";

/** A template with its tokens filled. */
export interface ResolvedTemplate {
  text: string;
  runs: TextNodeRun[];
  /** Every token came out empty and nothing else but whitespace is left. */
  empty: boolean;
  /** Expressions the resolver didn't know. */
  missing: string[];
  /**
   * Where each piece of the template landed, in order: a token, a character, or `{{` (two
   * characters writing one). A token that came out empty has `from === to`.
   */
  spans: TemplateSpan[];
}

/** A piece of a template (`start`–`end`) and the text it wrote (`from`–`to`). */
export interface TemplateSpan {
  start: number;
  end: number;
  from: number;
  to: number;
}
