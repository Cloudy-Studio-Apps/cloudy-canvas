import { createElementBase, type Point } from "@canvas";

import { ER_ENTITY_COLOR } from "../../../palette";
import { entitySize } from "../base/er-size";
import { NO_ER_DIAGRAM } from "../base/no-er-diagram";
import type { ErEntityElement } from "./entity.types";

/** A new entity centered on `center`. */
export function createErEntity(center: Point, name: string, index: string): ErEntityElement {
  const size = entitySize(name);
  const rect = {
    x: Math.round(center.x - size.w / 2),
    y: Math.round(center.y - size.h / 2),
    ...size,
  };
  return {
    ...createElementBase("er-entity", rect, index),
    ...NO_ER_DIAGRAM,
    name,
    weak: false,
    color: ER_ENTITY_COLOR,
  };
}
