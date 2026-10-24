import { DOCUMENT_TOKENS } from "@canvas";
import { isDesignNode, type DesignEngine, type DesignNode } from "@design";

/** Default names of new styles, by type. */
const NAMES: Readonly<Record<string, string>> = {
  paint: "Color",
  effect: "Effect",
  stroke: "Stroke",
};

/**
 * Adds a style of `styleType` from the first selected layer (`value` reads it, `bindings` the
 * variables it uses there, as paths in the style's value), named after its type ("Color 2");
 * its id, or `null` when nothing is selected. One undo step.
 */
export function createNodeStyle(
  engine: DesignEngine,
  styleType: string,
  value: (node: DesignNode) => object,
  bindings?: (node: DesignNode) => Record<string, string>,
): string | null {
  const node = engine
    .getState()
    .selectedIds.map((id) => engine.getElement(id))
    .find((el): el is DesignNode => el !== undefined && isDesignNode(el));
  if (!node) return null;
  return engine.service(DOCUMENT_TOKENS).createStyle({
    styleType,
    name: NAMES[styleType] ?? "Style",
    value: { ...value(node) },
    bindings: bindings?.(node),
  }).id;
}
