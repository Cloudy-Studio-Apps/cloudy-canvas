import { createElementBase, type Point } from "@canvas";
import { createId } from "@shared/core";

import { DB_ENUM_COLOR } from "../../../palette";
import { enumSize } from "./db-enum.layout";
import type { DbEnumElement } from "./db-enum.types";

/** A new enum with two example values, centered on `center`. */
export function createDbEnum(center: Point, name: string, index: string): DbEnumElement {
  const values = ["active", "inactive"].map((value) => ({ id: createId(), name: value, note: "" }));
  const size = enumSize(name, values);
  const rect = {
    x: Math.round(center.x - size.w / 2),
    y: Math.round(center.y - size.h / 2),
    ...size,
  };
  return { ...createElementBase("db-enum", rect, index), name, headerColor: DB_ENUM_COLOR, values };
}
