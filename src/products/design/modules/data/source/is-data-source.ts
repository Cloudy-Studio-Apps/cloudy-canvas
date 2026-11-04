import type { CanvasElement } from "@canvas";

import { DATA_SOURCE_TYPE } from "./data-source.constants";
import type { DataSourceElement } from "./data-source.types";

export function isDataSource(el: CanvasElement): el is DataSourceElement {
  return el.type === DATA_SOURCE_TYPE;
}
