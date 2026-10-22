import { DesignNodeKind } from "@design";
import type { PropertySelection } from "./design-editor-points.types";

// Building blocks for `PropertySectionEntry.when`.

/** Nothing is selected (the page's sections). */
export const noNodes = ({ nodes }: PropertySelection): boolean => nodes.length === 0;

/** Something is selected. */
export const someNodes = ({ nodes }: PropertySelection): boolean => nodes.length > 0;

/** Every selected node is of one of these types (e.g. the star section). */
export function ofType(...types: string[]): (selection: PropertySelection) => boolean {
  return ({ nodes }) => nodes.length > 0 && nodes.every((node) => types.includes(node.type));
}

/**
 * Every selected node's kind can do something (e.g. be filled); kinds that aren't design nodes
 * don't count against it.
 */
export function allKinds(
  can: (kind: DesignNodeKind) => boolean,
): (selection: PropertySelection) => boolean {
  return ({ nodes, kinds }) =>
    nodes.length > 0 &&
    nodes.every((node) => {
      const kind = kinds.kindOf(node);
      return !(kind instanceof DesignNodeKind) || can(kind);
    });
}
