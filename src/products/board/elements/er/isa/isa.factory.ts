import { createElementBase, type Point } from "@canvas";

import { ISA_SIZE } from "../base/er-size";
import { NO_ER_DIAGRAM } from "../base/no-er-diagram";
import type { ErIsaElement } from "./isa.types";

export function createErIsa(center: Point, parentId: string, index: string): ErIsaElement {
  const rect = {
    x: Math.round(center.x - ISA_SIZE.w / 2),
    y: Math.round(center.y - ISA_SIZE.h / 2),
    ...ISA_SIZE,
  };
  return {
    ...createElementBase("er-isa", rect, index),
    ...NO_ER_DIAGRAM,
    parentId,
    parentMin: "",
    parentMax: "",
    exclusive: false,
    total: false,
    children: [],
  };
}
