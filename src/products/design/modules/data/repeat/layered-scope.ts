import { childScope } from "../bindings";
import type { DataScope } from "../bindings";
import type { ScopeLayer } from "./scope-layer.types";

const LOOP_NAMES = ["$index", "$number", "$count"];

/**
 * One loop's scope inside `parent`: its row under its name with `$index`, `$number` (index + 1)
 * and `$count`, carrying its `names` (fields and source), as `rowScope` makes for a card
 * repeater. An unreadable layer's names read as unreadable, so what reads them is left alone.
 */
export function layerScope(parent: DataScope, layer: ScopeLayer): DataScope {
  if (layer.unreadable) {
    return {
      names: {},
      parent,
      fields: new Map(),
      sources: new Map(),
      unreadable: new Set([layer.name, ...LOOP_NAMES]),
    };
  }
  const values = {
    [layer.name]: layer.value,
    $index: layer.index,
    $number: layer.index + 1,
    $count: layer.count,
  };
  return childScope(parent, values, layer.names?.fields, layer.names?.sources);
}

/** The scope inside `layers` (outermost first) over `root`: each one's `layerScope` in turn. */
export function layeredScope(root: DataScope, layers: readonly ScopeLayer[]): DataScope {
  return layers.reduce(layerScope, root);
}
