import type { NodeDefaults } from "./design-node.types";

/** Values every design node starts with. */
export const NODE_DEFAULTS = {
  opacity: 1,
  strokeWeight: 1,
  strokeAlign: "inside",
  strokeCap: "none",
  strokeJoin: "miter",
  strokeMiterAngle: 28.96,
  stroke: { type: "solid", color: "#000000", opacity: 1, visible: true },
  maskType: "alpha",
} satisfies NodeDefaults;
