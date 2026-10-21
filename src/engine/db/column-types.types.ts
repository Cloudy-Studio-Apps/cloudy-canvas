export interface TypeArgsSpec {
  /** What the arguments are, e.g. `length` or `precision, scale`. */
  label: string;
  /** Arguments a column gets when it switches to this type (`""` for none). */
  initial: string;
}
