import type { ScopeLayer } from "../../../data";

/** What the providers answer for a pass: each page frame's loops and its brochure's language. */
export interface FramesAround {
  layers: Map<string, readonly ScopeLayer[]>;
  locales: Map<string, string>;
}
