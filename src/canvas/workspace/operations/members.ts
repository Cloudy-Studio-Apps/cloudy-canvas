import type { WorkspaceParts } from "./workspace-parts.types";

/** The ids plus what the product says goes with them when moved or deleted. */
export function withMembers(
  { product, scene }: WorkspaceParts,
  ids: Iterable<string>,
  purpose: "move" | "delete",
): Set<string> {
  const set = new Set(ids);
  return product.withMembers?.(set, scene.elements, purpose) ?? set;
}
