import { createElementBase } from "@canvas";

import { NO_ER_DIAGRAM } from "../base/no-er-diagram";
import type { ErAggregateElement } from "./aggregate.types";

/** Bounds are derived by the scene (see `resolveErElements`), so a new aggregation starts empty. */
export function createErAggregate(
  name: string,
  relationId: string,
  index: string,
): ErAggregateElement {
  return {
    ...createElementBase("er-aggregate", { x: 0, y: 0, w: 0, h: 0 }, index),
    ...NO_ER_DIAGRAM,
    name,
    relationId,
  };
}
