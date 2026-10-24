import type { VariableRecord } from "./token.types";

/** A group of variables or styles (a path prefix), shown as an accordion. */
export interface TokenGroupNode<T extends { name: string } = VariableRecord> {
  /** The full group path (`brand/primary`). */
  path: string;
  /** Its own name (`primary`). */
  name: string;
  groups: TokenGroupNode<T>[];
  /** The variables (or styles) right in it, in order. */
  variables: T[];
}
