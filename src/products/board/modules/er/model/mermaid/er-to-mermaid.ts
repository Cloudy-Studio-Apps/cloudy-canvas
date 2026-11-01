import { allErShapes } from "../er-shapes";
import type { ErShapes } from "../lang";
import { erMermaidAggregates } from "./er-mermaid-aggregates";
import { erMermaidEdges } from "./er-mermaid-edges";
import { erMermaidNodes } from "./er-mermaid-nodes";

/**
 * The diagram as a Mermaid flowchart. Mermaid has no Chen diagram, so a flowchart draws the same
 * shapes and lines, with the labels the board shows; only their positions are Mermaid's.
 */
export function erToMermaid(diagram: ErShapes): string {
  const attributes = [...diagram.attributes].sort((a, b) => a.order - b.order);
  const shapes = { ...diagram, attributes };
  const { ids, lines, identifying, derived } = erMermaidNodes(shapes);
  const name = allErShapes(shapes).find((shape) => shape.diagramName)?.diagramName;
  return [
    ...(name ? ["---", `title: ${JSON.stringify(name)}`, "---"] : []),
    "flowchart TD",
    ...lines,
    ...erMermaidAggregates(shapes, ids),
    ...erMermaidEdges(shapes, ids),
    ...style("identifying", "stroke-width:3px", identifying),
    ...style("derived", "stroke-dasharray:5 5", derived),
  ].join("\n");
}

function style(name: string, css: string, nodes: readonly string[]): string[] {
  if (nodes.length === 0) return [];
  return [`  classDef ${name} ${css}`, `  class ${nodes.join(",")} ${name}`];
}
