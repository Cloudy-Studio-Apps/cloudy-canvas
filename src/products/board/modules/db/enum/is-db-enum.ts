import type { CanvasElement } from "@canvas";

import type { DbEnumElement } from "./db-enum.types";

export function isDbEnum(el: CanvasElement | undefined): el is DbEnumElement {
  return el?.type === "db-enum";
}
