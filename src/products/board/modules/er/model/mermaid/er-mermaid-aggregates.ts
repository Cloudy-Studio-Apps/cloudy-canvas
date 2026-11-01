import type { ErAggregateElement } from "../../aggregate/aggregate.types";
import type { ErShapes } from "../lang";
import { mermaidText } from "./mermaid-text";

/**
 * Each aggregation as a subgraph round its relation and participants, an aggregation inside another
 * nested in it. Mermaid keeps a node in one subgraph, so a shape shared by two stays in the first.
 */
export function erMermaidAggregates(shapes: ErShapes, ids: ReadonlyMap<string, string>): string[] {
  const placed = new Set<string>();
  const aggregates = new Map(shapes.aggregates.map((aggregate) => [aggregate.id, aggregate]));
  const membersOf = ({ relationId }: ErAggregateElement) => {
    const relation = shapes.relations.find((each) => each.id === relationId);
    return [relationId, ...(relation?.participants.map((p) => p.entityId) ?? [])];
  };
  const write = (aggregate: ErAggregateElement): string[] => {
    placed.add(aggregate.id);
    const body = membersOf(aggregate).flatMap((id) => {
      if (placed.has(id)) return [];
      const inner = aggregates.get(id);
      if (inner) return write(inner).map((line) => `  ${line}`);
      placed.add(id);
      const node = ids.get(id);
      return node ? [`  ${node}`] : [];
    });
    const open = `subgraph ${ids.get(aggregate.id)}["${mermaidText(aggregate.name)}"]`;
    return [open, ...body, "end"];
  };

  const inner = new Set(shapes.aggregates.flatMap(membersOf));
  const outerFirst = [...shapes.aggregates].sort(
    (a, b) => Number(inner.has(a.id)) - Number(inner.has(b.id)),
  );
  return outerFirst.flatMap((aggregate) =>
    placed.has(aggregate.id) ? [] : write(aggregate).map((line) => `  ${line}`),
  );
}
