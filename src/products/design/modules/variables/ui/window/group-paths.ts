import { tokenGroupOf, tokenLeafOf, type VariableRecord } from "@canvas";

/** A collection's variables by group path (top-level variables under `""`), in order. */
export function variablesByGroup(
  variables: readonly VariableRecord[],
): Map<string, VariableRecord[]> {
  const groups = new Map<string, VariableRecord[]>();
  for (const variable of variables) {
    const group = tokenGroupOf(variable.name);
    const list = groups.get(group) ?? [];
    list.push(variable);
    groups.set(group, list);
  }
  return groups;
}

/** A variable's name in its group (`primary/500` → `500`). */
export const leafName = (variable: VariableRecord): string => tokenLeafOf(variable.name);

/** `group/name`, or `name` at the top. */
export const joinPath = (group: string, name: string): string =>
  group ? `${group}/${name}` : name;

/** A group name not used yet in the collection: `name`, else `name 2`, `name 3`… */
export function freeGroup(variables: readonly VariableRecord[], name: string): string {
  const used = new Set(variables.map((v) => tokenGroupOf(v.name)));
  if (!used.has(name)) return name;
  for (let n = 2; ; n++) if (!used.has(`${name} ${n}`)) return `${name} ${n}`;
}
