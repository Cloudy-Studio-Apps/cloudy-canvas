import type { Rect } from "@canvas";

import { createNodeBase } from "../core";
import { GROUP_TYPE } from "./group.constants";
import type { GroupElement } from "./group.types";

export function createGroup(
  rect: Rect,
  name: string,
  index: string,
  parentId: string | null,
): GroupElement {
  return createNodeBase(GROUP_TYPE, rect, index, { name, parentId });
}
