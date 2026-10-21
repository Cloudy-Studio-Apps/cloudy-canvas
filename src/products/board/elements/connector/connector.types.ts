import type { ElementDefaults, ElementSide, LineElement, Point } from "@canvas";

/** One end of a connector: stuck to an element, or free at (x, y) in world coordinates. */
export interface ConnectorEnd {
  shapeId: string | null;
  /** Side of the element it leaves from; `null` picks the side facing the other end. */
  side: ElementSide | null;
  /** Free position, and the fallback if the attached element disappears. */
  x: number;
  y: number;
}

export type ConnectorStyle = "straight" | "elbow";
export type ArrowHead = "none" | "arrow";

/**
 * A line between two ends that follows the elements it's attached to. Its bounds and `points` are
 * derived from the ends whenever the board changes (see `resolveConnectors`), so read its
 * geometry from the scene, not the document.
 */
export interface ConnectorElement extends LineElement {
  type: "connector";
  start: ConnectorEnd;
  end: ConnectorEnd;
  style: ConnectorStyle;
  color: string;
  /** Line thickness in world units. */
  size: number;
  startHead: ArrowHead;
  endHead: ArrowHead;
}

/** Looks of a connector, shared by the connector tool options and new connectors. */
export interface ConnectorLook {
  style: ConnectorStyle;
  color: string;
  startHead: ArrowHead;
  endHead: ArrowHead;
}

/** Which end of a connector. */
export type ConnectorEndName = "start" | "end";

/** Where an end attaches once resolved. */
export interface ResolvedEnd {
  point: Point;
  /** Outward direction of the side it leaves from; `null` for a free end. */
  dir: Point | null;
}

export interface ConnectorDefaults extends ElementDefaults {
  /** Line thickness of new connectors. */
  lineWidth: number;
  /** How far an elbow route leaves an element before its first turn. */
  stub: number;
  /** Room around the route for arrowheads, so bounds (and hit-testing) include them. */
  headRoom: number;
  headLength: number;
  /** Half the angle between an arrowhead's two strokes, in radians. */
  headAngle: number;
  /** Extra grab distance around the line. */
  reach: number;
  /** Distance of the quick-connect dots from an element, and their grab radius, in screen px. */
  quickConnectOffset: number;
  quickConnectRadius: number;
}

/** An agent's patch may re-attach ends with `from`/`to`, given as in a spec. */
export interface ConnectorEndsPatch {
  from?: unknown;
  to?: unknown;
}
