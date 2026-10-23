import { createElementBase, type Point } from "@canvas";

import { ER_RELATION_COLOR } from "../../../palette";
import { relationSize } from "../base/er-size";
import { NO_ER_DIAGRAM } from "../base/no-er-diagram";
import type { ErRelationElement } from "./relation.types";

export function createErRelation(center: Point, name: string, index: string): ErRelationElement {
  const size = relationSize(name);
  const rect = {
    x: Math.round(center.x - size.w / 2),
    y: Math.round(center.y - size.h / 2),
    ...size,
  };
  return {
    ...createElementBase("er-relation", rect, index),
    ...NO_ER_DIAGRAM,
    name,
    identifying: false,
    idMark: false,
    existenceMark: false,
    color: ER_RELATION_COLOR,
    participants: [],
    associative: false,
  };
}
