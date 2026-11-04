/** A piece of a template: plain text (`{{` already read as `{`) or a `{expr}` token. `start`/`end` are offsets in the source text. */
export type TemplatePart =
  | { kind: "text"; text: string; start: number; end: number }
  | { kind: "token"; expr: string; start: number; end: number };
