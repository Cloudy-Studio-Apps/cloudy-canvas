import { resolveErLinks } from "../../links/er-links";
import type { ErLink } from "../../links/er-links.types";
import { allErShapes } from "../er-shapes";
import type { ErShapes } from "../lang";
import { mermaidText } from "./mermaid-text";

/** Directed constraints point from the requirement to what it requires. */
const DIRECTED = new Set(["inclusive", "inclusion"]);

/** The diagram's lines, as the board labels them, then its constraints as dotted lines. */
export function erMermaidEdges(shapes: ErShapes, ids: ReadonlyMap<string, string>): string[] {
  const started = new Set<string>();
  const lines = resolveErLinks(allErShapes(shapes)).flatMap((link) => {
    const flip = !link.arrow && startsAtTheEnd(link, shapes, started);
    const from = ids.get(flip ? link.toId : link.fromId);
    const to = ids.get(flip ? link.fromId : link.toId);
    return from && to ? [edge(from, connector(link), link.label, to)] : [];
  });
  for (const constraint of shapes.constraints) {
    const from = ids.get(constraint.fromId);
    const to = ids.get(constraint.toId);
    if (!from || !to) continue;
    const { rule, min, max } = constraint;
    const label = min || max ? `${rule} (${min},${max})` : rule;
    lines.push(edge(from, DIRECTED.has(rule) ? "-.->" : "-.-", label, to));
  }
  return lines;
}

function connector({ arrow, double, totalMark }: ErLink): string {
  if (double || totalMark) return arrow ? "==>" : "===";
  return arrow ? "-->" : "---";
}

function edge(from: string, line: string, label: string, to: string): string {
  return `  ${from} ${line}${label ? `|"${mermaidText(label)}"|` : ""} ${to}`;
}

/**
 * Mermaid lays nodes out in the direction of the lines, while the board's all leave from the
 * relation or attribute. Lines that read better the other way are written from their far end:
 * owners above their attributes, parents above hierarchies, a relation's first entity above it.
 */
function startsAtTheEnd(
  { fromId, toId }: ErLink,
  { attributes, isas, unions, relations }: ErShapes,
  started: Set<string>,
): boolean {
  if (attributes.some((attribute) => attribute.id === fromId)) return true;
  if (isas.some((isa) => isa.id === fromId && isa.parentId === toId)) return true;
  if (unions.some((union) => union.id === fromId && union.categoryId !== toId)) return true;
  if (!relations.some((relation) => relation.id === fromId) || started.has(fromId)) return false;
  started.add(fromId);
  return true;
}
