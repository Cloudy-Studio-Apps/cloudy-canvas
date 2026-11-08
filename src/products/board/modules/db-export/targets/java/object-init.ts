import type { RelationProps } from "../../code";

/**
 * Whether a reference can start as `new Other()` without creating objects forever: not when it
 * points at its own class or the other class leads back to this one through such references.
 */
export function objectInit(props: readonly RelationProps[]): (p: RelationProps) => boolean {
  const edges = new Map<string, Set<string>>();
  for (const { relation } of props) {
    if (relation.kind === "many-to-many") continue;
    const targets = edges.get(relation.from.table) ?? new Set<string>();
    edges.set(relation.from.table, targets.add(relation.to.table));
  }
  const reaches = (start: string, goal: string): boolean => {
    const seen = new Set<string>();
    const stack = [start];
    while (stack.length > 0) {
      const table = stack.pop() ?? "";
      if (table === goal) return true;
      if (seen.has(table)) continue;
      seen.add(table);
      stack.push(...(edges.get(table) ?? []));
    }
    return false;
  };
  return ({ relation }) =>
    relation.kind !== "many-to-many" &&
    relation.from.table !== relation.to.table &&
    !reaches(relation.to.table, relation.from.table);
}
