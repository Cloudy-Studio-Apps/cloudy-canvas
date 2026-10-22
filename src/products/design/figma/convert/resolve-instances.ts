import type { FigNode, FigOverride, ResolvedFigNode } from "./fig-node.types";
import { guidKey } from "./fig-tree";
import type { FigTree } from "./fig-tree.types";
import type { ImportWarnings } from "./import-warnings";
import type { InstanceScope } from "./resolve-instances.types";

/** Deepest nesting of instances followed (a component can't contain itself, but files lie). */
const MAX_DEPTH = 40;

/**
 * `node` with its children, every instance expanded: an instance stores only what it changes
 * on its component (overrides by guid path, its resolved layout, its text and visibility
 * properties), so its children are the component's, changed by it and by the instances around
 * it.
 */
export function resolveFigNode(
  tree: FigTree,
  node: FigNode,
  warnings: ImportWarnings,
): ResolvedFigNode {
  return resolve(tree, node, null, [], warnings, 0);
}

function resolve(
  tree: FigTree,
  raw: FigNode,
  scope: InstanceScope | null,
  path: readonly string[],
  warnings: ImportWarnings,
  depth: number,
): ResolvedFigNode {
  const node = scope ? applyScope(raw, scope, path) : raw;
  if (node.type !== "INSTANCE") {
    const children = tree
      .childrenOf(raw)
      .map((child) =>
        resolve(tree, child, scope, scope ? [...path, guidKey(child.guid)] : [], warnings, depth),
      );
    return { node, children };
  }
  const component = tree.node(node.overriddenSymbolID ?? node.symbolData?.symbolID);
  if (!component || depth >= MAX_DEPTH) {
    warnings.add("instances whose component isn't in the file were left empty");
    return { node, children: [] };
  }
  const inner = instanceScope(node, scope, path);
  const children = tree
    .childrenOf(component)
    .map((child) => resolve(tree, child, inner, [guidKey(child.guid)], warnings, depth + 1));
  return { node, children };
}

/** The node as the instances around it show it. */
function applyScope(raw: FigNode, scope: InstanceScope, path: readonly string[]): FigNode {
  const key = path.join("/");
  let node: FigNode = raw;
  // A record's `guidPath` comes along but nothing reads it.
  for (const record of [...(scope.overrides.get(key) ?? []), ...(scope.derived.get(key) ?? [])]) {
    node = { ...node, ...record };
  }
  for (const ref of node.componentPropRefs ?? []) {
    const value = scope.props.get(guidKey(ref.defID))?.value;
    if (ref.componentPropNodeField === "TEXT_DATA" && value?.textValue) {
      node = { ...node, textData: value.textValue };
    } else if (ref.componentPropNodeField === "VISIBLE" && value?.boolValue !== undefined) {
      node = { ...node, visible: value.boolValue };
    }
  }
  return node;
}

/**
 * What applies inside `instance`: its own overrides and layout, then those of the instances
 * around it that reach into it (their paths start with the instance's), which win.
 */
function instanceScope(
  instance: FigNode,
  outer: InstanceScope | null,
  path: readonly string[],
): InstanceScope {
  const prefix = path.join("/") + "/";
  const overrides = new Map<string, FigOverride[]>();
  const derived = new Map<string, FigOverride[]>();
  addByPath(overrides, instance.symbolData?.symbolOverrides);
  if (outer) addNested(overrides, outer.overrides, prefix);
  addByPath(derived, instance.derivedSymbolData);
  if (outer) addNested(derived, outer.derived, prefix);
  const props = new Map(
    (instance.componentPropAssignments ?? []).map((prop) => [guidKey(prop.defID), prop]),
  );
  return { overrides, derived, props };
}

function addByPath(map: Map<string, FigOverride[]>, records: FigOverride[] | undefined): void {
  for (const record of records ?? []) {
    const key = (record.guidPath?.guids ?? []).map(guidKey).join("/");
    if (key) push(map, key, record);
  }
}

function addNested(
  map: Map<string, FigOverride[]>,
  outer: ReadonlyMap<string, readonly FigOverride[]>,
  prefix: string,
): void {
  for (const [key, records] of outer) {
    if (!key.startsWith(prefix)) continue;
    for (const record of records) push(map, key.slice(prefix.length), record);
  }
}

function push(map: Map<string, FigOverride[]>, key: string, record: FigOverride): void {
  const list = map.get(key);
  if (list) list.push(record);
  else map.set(key, [record]);
}
