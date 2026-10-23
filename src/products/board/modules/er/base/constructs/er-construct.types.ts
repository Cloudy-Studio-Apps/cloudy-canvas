import type { ErShapes } from "../../model/lang";

/**
 * Something a diagram can use that a standard may not have (union types, weak entities, …). Every
 * construct, built-in or a plugin's, is one of these, written with `defineErConstruct` and
 * contributed to the board's `erConstructs` point; standards forbid them by id (`forbids`).
 */
export interface ErConstructDefinition {
  id: string;
  /** Its plural name, for messages ("Union types aren't part of …"). */
  label: string;
  /** The shapes of the diagram that use it (the ones to fix when it's forbidden). */
  detect: (shapes: ErShapes) => string[];
}

/** What a standard lets a diagram add: answered per construct, with the reason when it doesn't. */
export interface ErConstructGate {
  allows: (construct: string) => boolean;
  /** "Union types aren't part of de Miguel & Piattini" (empty when allowed). */
  reason: (construct: string) => string;
}
