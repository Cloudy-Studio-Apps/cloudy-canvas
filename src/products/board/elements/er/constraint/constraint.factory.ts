import { createElementBase } from "@canvas";

import { NO_ER_DIAGRAM } from "../base/no-er-diagram";
import type { ErConstraintElement, ErConstraintRule } from "./constraint.types";

/** Bounds and points are derived by the scene (see `resolveErElements`), so it starts empty. */
export function createErConstraint(
  rule: ErConstraintRule,
  fromId: string,
  toId: string,
  entityId: string,
  index: string,
): ErConstraintElement {
  return {
    ...createElementBase("er-constraint", { x: 0, y: 0, w: 0, h: 0 }, index),
    ...NO_ER_DIAGRAM,
    rule,
    entityId,
    fromId,
    toId,
    min: rule === "inclusive" ? "1" : "",
    max: rule === "inclusive" ? "n" : "",
    points: [],
  };
}
