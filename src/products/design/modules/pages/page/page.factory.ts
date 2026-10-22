import { createElementBase } from "@canvas";

import { PAGE_TYPE } from "./page.constants";
import type { PageElement } from "./page.types";

/** A new page at `index` in the page order. */
export function createPage(name: string, index: string): PageElement {
  return { ...createElementBase(PAGE_TYPE, { x: 0, y: 0, w: 0, h: 0 }, index), name };
}
