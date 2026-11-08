import type { Point, Rect } from "@canvas";
import type { PrototypeInteraction } from "../../model";

/** An arrow on screen: its curve, where it starts, where its head sits and the head's turn. */
export interface LinkPath {
  /** SVG path data, in screen px. */
  d: string;
  /** The layer's end: where the square origin sits. */
  origin: Point;
  /** The tip of the head, on the target screen's edge. */
  end: Point;
  /** Degrees the head is turned by: 0 forward, -90 into a bottom edge, 90 into a top edge. */
  angle: number;
}

export interface LinkArrowProps {
  path: LinkPath;
  /** An overlay link: dashed. */
  dashed: boolean;
  /** The selection's arrow: thicker. */
  active: boolean;
}

export interface LinkStubProps {
  /** The layer on screen. */
  rect: Rect;
  action: "back" | "close" | "link";
  active: boolean;
}

export interface FlowFlagProps {
  /** The flow's starting screen on screen. */
  rect: Rect;
  flow: { id: string; name: string };
}

/** A node of the page with interactions, and the screen it's on. */
export interface PageLink {
  id: string;
  screenId: string;
  interactions: PrototypeInteraction[];
}
