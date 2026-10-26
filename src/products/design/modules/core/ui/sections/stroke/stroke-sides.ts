import type { BoxSides, ElementPatch } from "@canvas";
import type { DesignNode } from "../../../node/design-node.types";
import type { StrokeSidesMode } from "./stroke-sides.types";

export const SIDES: readonly (keyof BoxSides)[] = ["top", "right", "bottom", "left"];

/** The sides a node's stroke is on (`all` when it has one weight). */
export function sidesMode(node: DesignNode): StrokeSidesMode {
  const sides = node.strokeWeights;
  if (!sides) return "all";
  const stroked = SIDES.filter((side) => sides[side] > 0);
  if (stroked.length === 1) return stroked[0]!;
  const [first] = SIDES.map((side) => sides[side]);
  return SIDES.every((side) => sides[side] === first) ? "all" : "custom";
}

/** Puts a node's stroke on `mode`'s sides, at its current weight. */
export function sidesPatch(mode: StrokeSidesMode, node: DesignNode): ElementPatch<DesignNode> {
  const weight = node.strokeWeight > 0 ? node.strokeWeight : 1;
  if (mode === "all") return { strokeWeights: null, strokeWeight: weight };
  if (mode === "custom") {
    return { strokeWeights: node.strokeWeights ?? uniform(weight), strokeWeight: weight };
  }
  return { strokeWeights: { ...uniform(0), [mode]: weight }, strokeWeight: weight };
}

/** Sets the weight of a node's stroke on the sides it's on (all, or the one side). */
export function weightPatch(weight: number, node: DesignNode): ElementPatch<DesignNode> {
  const mode = sidesMode(node);
  if (mode === "all" || mode === "custom") return { strokeWeight: weight, strokeWeights: null };
  return { strokeWeight: weight, strokeWeights: { ...uniform(0), [mode]: weight } };
}

/** Sets one side's weight (the widest side's is the node's `strokeWeight`). */
export function sidePatch(
  side: keyof BoxSides,
  weight: number,
  node: DesignNode,
): ElementPatch<DesignNode> {
  const sides = { ...(node.strokeWeights ?? uniform(node.strokeWeight)), [side]: weight };
  return { strokeWeights: sides, strokeWeight: Math.max(...SIDES.map((s) => sides[s])) };
}

function uniform(weight: number): BoxSides {
  return { top: weight, right: weight, bottom: weight, left: weight };
}
