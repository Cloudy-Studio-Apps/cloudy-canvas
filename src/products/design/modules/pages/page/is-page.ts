import type { CanvasElement } from "@canvas";

import { PAGE_TYPE } from "./page.constants";
import type { PageElement } from "./page.types";

export function isPage(el: CanvasElement): el is PageElement {
  return el.type === PAGE_TYPE;
}
