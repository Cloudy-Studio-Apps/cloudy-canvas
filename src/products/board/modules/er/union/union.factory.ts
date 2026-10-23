import { createElementBase, type Point } from "@canvas";

import { UNION_SIZE } from "../base/er-size";
import { NO_ER_DIAGRAM } from "../base/no-er-diagram";
import type { ErUnionElement } from "./union.types";

export function createErUnion(center: Point, categoryId: string, index: string): ErUnionElement {
  const rect = {
    x: Math.round(center.x - UNION_SIZE.w / 2),
    y: Math.round(center.y - UNION_SIZE.h / 2),
    ...UNION_SIZE,
  };
  return {
    ...createElementBase("er-union", rect, index),
    ...NO_ER_DIAGRAM,
    categoryId,
    superclassIds: [],
  };
}
