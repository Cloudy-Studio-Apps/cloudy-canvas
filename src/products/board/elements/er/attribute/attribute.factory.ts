import { createElementBase, type Point } from "@canvas";

import { attributeSize } from "../base/er-size";
import { NO_ER_DIAGRAM } from "../base/no-er-diagram";
import type { ErAttributeElement, ErAttributeLook } from "./attribute.types";

export function createErAttribute(
  center: Point,
  ownerId: string,
  name: string,
  index: string,
  look: ErAttributeLook = "ellipse",
): ErAttributeElement {
  const size = attributeSize(name, look);
  const rect = {
    x: Math.round(center.x - size.w / 2),
    y: Math.round(center.y - size.h / 2),
    ...size,
  };
  return {
    ...createElementBase("er-attribute", rect, index),
    ...NO_ER_DIAGRAM,
    ownerId,
    name,
    key: "none",
    multivalued: false,
    derived: false,
    optional: false,
    look,
    order: 0,
  };
}
