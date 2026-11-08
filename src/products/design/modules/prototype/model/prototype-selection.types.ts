/**
 * What the Prototype mode's panels are about: nothing, a flow picked in the Flows tab, a screen
 * (a top-level frame) or a layer on a screen.
 */
export type PrototypeSelection =
  | { kind: "none" }
  | { kind: "flow"; id: string }
  | { kind: "screen"; id: string }
  | { kind: "layer"; id: string; screen: string };
