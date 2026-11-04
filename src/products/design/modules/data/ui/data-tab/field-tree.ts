import type { DataField } from "../../source";
import { guessFields, parsePath, readPath, type DataRow } from "../../table";
import type { FieldGroupNode, FieldTreeNode } from "./field-tree.types";

const isObject = (v: unknown): v is DataRow =>
  v !== null && typeof v === "object" && !Array.isArray(v);

/** The keys of a path, or `null` when it has an index step or doesn't parse (shown as it is). */
function keysOf(path: string): string[] | null {
  try {
    const steps = parsePath(path);
    const keys: string[] = [];
    for (const step of steps) {
      if (!("key" in step)) return null;
      keys.push(step.key);
    }
    return keys;
  } catch {
    return null;
  }
}

/** The fields inside a list field's items (`reviews` → rating, comment), from the first rows. */
function innerFields(rows: readonly DataRow[], path: string): DataField[] | undefined {
  const items: DataRow[] = [];
  for (const row of rows.slice(0, 50)) {
    let value: unknown;
    try {
      value = readPath(row, path);
    } catch {
      return undefined;
    }
    if (Array.isArray(value)) for (const item of value) if (isObject(item)) items.push(item);
  }
  return items.length > 0 ? guessFields(items, []) : undefined;
}

/**
 * The source's fields as a tree: `dimensions.width` sits under a `dimensions` group, in the
 * fields' order (a group where its first field is); a list of objects carries its items' fields.
 */
export function fieldTree(fields: readonly DataField[], rows: readonly DataRow[]): FieldTreeNode[] {
  const root: FieldTreeNode[] = [];
  const groups = new Map<string, FieldGroupNode>();
  fields.forEach((field, index) => {
    const keys = keysOf(field.path);
    let level = root;
    let at = "";
    for (const key of (keys ?? []).slice(0, -1)) {
      at = at ? `${at}\u0000${key}` : key;
      let group = groups.get(at);
      if (!group) {
        group = { kind: "group", id: `group:${at}`, name: key, children: [] };
        groups.set(at, group);
        level.push(group);
      }
      level = group.children;
    }
    const name = keys?.[keys.length - 1] ?? field.path;
    const inner = field.type === "list" ? innerFields(rows, field.path) : undefined;
    level.push({ kind: "field", id: field.path, field, index, name, ...(inner ? { inner } : {}) });
  });
  return root;
}

/** How many fields a tree holds. */
export function countFields(nodes: readonly FieldTreeNode[]): number {
  return nodes.reduce((n, node) => n + (node.kind === "group" ? countFields(node.children) : 1), 0);
}
