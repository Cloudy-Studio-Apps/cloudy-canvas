import type { AppModule, ExtensionPoint, ModuleHost } from "./modules.types";
import { sortModules } from "./sort-modules";

interface PointItems {
  items: unknown[];
  /** Key → id of the module that contributed it. */
  keys: Map<string, { item: unknown; module: string }>;
}

/**
 * Loads modules: sorts them by their dependencies and runs each `register`. Afterwards the host
 * is read-only, so what the points hold never changes while an editor uses them.
 */
export function createModuleHost(modules: readonly AppModule[]): ModuleHost {
  const sorted = sortModules(modules);
  const ids = new Set(sorted.map((module) => module.id));
  const points = new Map<ExtensionPoint<unknown>, PointItems>();
  let registering: string | null = null;

  const itemsOf = (point: ExtensionPoint<unknown>): PointItems => {
    let entry = points.get(point);
    if (!entry) {
      entry = { items: [], keys: new Map() };
      points.set(point, entry);
    }
    return entry;
  };

  const host: ModuleHost = {
    contribute<T>(point: ExtensionPoint<T>, ...items: T[]) {
      if (!registering) {
        throw new Error(`"${point.id}" can only be contributed to while modules register.`);
      }
      const entry = itemsOf(point as ExtensionPoint<unknown>);
      for (const item of items) {
        if (point.keyOf) {
          const key = point.keyOf(item);
          const taken = entry.keys.get(key);
          if (taken) {
            throw new Error(
              `The module "${registering}" contributes "${key}" to "${point.id}", which the module "${taken.module}" already did.`,
            );
          }
          entry.keys.set(key, { item, module: registering });
        }
        entry.items.push(item);
      }
    },
    get: <T>(point: ExtensionPoint<T>) =>
      (points.get(point as ExtensionPoint<unknown>)?.items ?? []) as readonly T[],
    find: <T>(point: ExtensionPoint<T>, key: string) =>
      points.get(point as ExtensionPoint<unknown>)?.keys.get(key)?.item as T | undefined,
    has: (moduleId) => ids.has(moduleId),
  };

  for (const module of sorted) {
    registering = module.id;
    try {
      module.register(host);
    } finally {
      registering = null;
    }
  }
  return host;
}
