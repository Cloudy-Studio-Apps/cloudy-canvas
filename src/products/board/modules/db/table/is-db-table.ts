import type { CanvasElement } from "@canvas";

import type { DbTableElement } from "./db-table.types";

export function isDbTable(el: CanvasElement | undefined): el is DbTableElement {
  return el?.type === "db-table";
}
