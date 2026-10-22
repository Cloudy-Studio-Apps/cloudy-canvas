import type { AppModule, ExtensionPoint, ModuleHost, ModuleLoadOptions } from "./modules.types";
import { sortModules } from "./sort-modules";

interface PointItems {
  items: unknown[];
  /** Key → the item and the id of the module that contributed it. */
  keys: Map<string, { item: unknown; module: string }>;
}

type Points = Map<ExtensionPoint<unknown>, PointItems>;

/**
 * Loads modules: sorts them by their dependencies and runs each `register`. Afterwards the host
 * is read-only, so what the points hold never changes while an editor uses them. An optional
 * module's contributions only count once its `register` finished without throwing; if it fails,
 * it's left out (with the modules that require it) and reported through `onError`.
 */
export function createModuleHost(
  modules: readonly AppModule[],
  options: ModuleLoadOptions = {},
): ModuleHost {
  const { isOptional = () => false, onError } = options;
  const sorted = sortModules(modules, options);
  const loaded = new Set<string>();
  const points: Points = new Map();
  /** Where the module that's registering contributes: the points, or its own staging area. */
  let target: { module: string; points: Points } | null = null;

  const host: ModuleHost = {
    contribute<T>(point: ExtensionPoint<T>, ...items: T[]) {
      // Plugins are plain JavaScript: a misspelled point reaches here as `undefined`.
      if (!point || typeof point.id !== "string") {
        throw new Error(
          `The module "${target?.module ?? "?"}" contributes to a point that doesn't exist (${String(point)}).`,
        );
      }
      if (!target) {
        throw new Error(`"${point.id}" can only be contributed to while modules register.`);
      }
      const entry = itemsOf(target.points, point as ExtensionPoint<unknown>);
      for (const item of items) {
        if (point.keyOf) {
          const key = point.keyOf(item);
          const taken =
            points.get(point as ExtensionPoint<unknown>)?.keys.get(key) ?? entry.keys.get(key);
          if (taken) {
            throw new Error(
              `The module "${target.module}" contributes "${key}" to "${point.id}", which the module "${taken.module}" already did.`,
            );
          }
          entry.keys.set(key, { item, module: target.module });
        }
        entry.items.push(item);
      }
    },
    get: <T>(point: ExtensionPoint<T>) =>
      (points.get(point as ExtensionPoint<unknown>)?.items ?? []) as readonly T[],
    find: <T>(point: ExtensionPoint<T>, key: string) =>
      points.get(point as ExtensionPoint<unknown>)?.keys.get(key)?.item as T | undefined,
    ownerOf: <T>(point: ExtensionPoint<T>, key: string) =>
      points.get(point as ExtensionPoint<unknown>)?.keys.get(key)?.module,
    has: (moduleId) => loaded.has(moduleId),
  };

  for (const module of sorted) {
    if (!isOptional(module)) {
      target = { module: module.id, points };
      try {
        module.register(host);
      } finally {
        target = null;
      }
      loaded.add(module.id);
      continue;
    }

    const missing = module.requires?.find((id) => !loaded.has(id));
    if (missing) {
      onError?.(
        module,
        new Error(`The module "${module.id}" requires "${missing}", which failed.`),
      );
      continue;
    }
    const staged: Points = new Map();
    target = { module: module.id, points: staged };
    try {
      module.register(host);
    } catch (error) {
      onError?.(module, error instanceof Error ? error : new Error(String(error)));
      continue;
    } finally {
      target = null;
    }
    commit(points, staged);
    loaded.add(module.id);
  }
  return host;
}

function itemsOf(points: Points, point: ExtensionPoint<unknown>): PointItems {
  let entry = points.get(point);
  if (!entry) {
    entry = { items: [], keys: new Map() };
    points.set(point, entry);
  }
  return entry;
}

function commit(points: Points, staged: Points): void {
  for (const [point, { items, keys }] of staged) {
    const entry = itemsOf(points, point);
    entry.items.push(...items);
    for (const [key, value] of keys) entry.keys.set(key, value);
  }
}
