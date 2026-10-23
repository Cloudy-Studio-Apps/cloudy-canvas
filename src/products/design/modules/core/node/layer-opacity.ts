import type { DesignNodeKind } from "./design-node.kind";
import type { DesignNode } from "./design-node.types";

/**
 * Whether a kind's opacity covers the layers it holds, as in Figma: frames, sections and groups.
 * Their opacity is applied by their effect scope (`designEffects`), over their own look and what
 * they hold together, so their own paints are drawn opaque (`withoutLayerOpacity`). A boolean
 * draws its operands itself, so its opacity stays its own.
 */
export function opacityCoversChildren(kind: DesignNodeKind): boolean {
  return kind.container || (kind.childHost && kind.drawsChildren);
}

/** The node as its own paints draw it when its opacity is applied by its scope. */
export function withoutLayerOpacity<E extends DesignNode>(el: E): E {
  return el.opacity === 1 ? el : { ...el, opacity: 1 };
}
