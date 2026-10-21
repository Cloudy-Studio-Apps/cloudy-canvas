import type { ConnectorEnd } from "../document";

export type ConnectorDragTarget =
  /** Moves one end of an existing connector. */
  | { kind: "existing"; id: string; which: "start" | "end" }
  /** Draws a new connector from `start`; it's added once the drag really starts. */
  | { kind: "new"; start: ConnectorEnd };
