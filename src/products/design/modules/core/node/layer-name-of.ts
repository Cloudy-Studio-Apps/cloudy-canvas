import type { ElementKinds } from "@canvas";

import { DesignNodeKind } from "./design-node.kind";
import type { DesignNode } from "./design-node.types";

/** A node's name in the layers panel (its kind's `layerName`). */
export function layerNameOf(node: DesignNode, kinds: ElementKinds): string {
  const kind = kinds.kindOf(node);
  return kind instanceof DesignNodeKind ? kind.layerName(node) : node.name;
}
