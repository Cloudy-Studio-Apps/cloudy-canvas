import type { CanvasElement } from "@canvas";

import type { TableElement } from "./table.types";

export function isTable(el: CanvasElement | undefined): el is TableElement {
  return el?.type === "table";
}
