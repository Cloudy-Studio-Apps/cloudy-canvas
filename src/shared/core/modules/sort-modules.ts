import type { AppModule, ModuleLoadOptions } from "./modules.types";

/**
 * The modules in an order where each comes after the ones it `requires` or is `after`, keeping
 * the given order otherwise. Throws on duplicate ids, missing requirements and cycles, except for
 * optional modules (see `ModuleLoadOptions`), which are left out and reported instead.
 */
export function sortModules(
  modules: readonly AppModule[],
  { isOptional = () => false, onError }: ModuleLoadOptions = {},
): AppModule[] {
  const byId = new Map<string, AppModule>();
  const drop = (module: AppModule, message: string) => {
    if (!isOptional(module)) throw new Error(message);
    byId.delete(module.id);
    onError?.(module, new Error(message));
  };

  for (const module of modules) {
    if (byId.has(module.id)) drop(module, `The module "${module.id}" is loaded twice.`);
    else byId.set(module.id, module);
  }
  for (;;) {
    pruneMissing(byId, drop);
    const cycle = findCycle([...byId.values()], byId);
    if (!cycle) break;
    const message = `Modules depend on each other in a loop: ${cycle.join(" → ")}.`;
    const optional = [...new Set(cycle)].flatMap((id) => {
      const module = byId.get(id);
      return module && isOptional(module) ? [module] : [];
    });
    if (optional.length === 0) throw new Error(message);
    for (const module of optional) drop(module, message);
  }
  return order([...byId.values()], byId);
}

/** Leaves out modules whose requirements aren't loaded, until none are left. */
function pruneMissing(
  byId: Map<string, AppModule>,
  drop: (module: AppModule, message: string) => void,
): void {
  let changed = true;
  while (changed) {
    changed = false;
    for (const module of [...byId.values()]) {
      const missing = [...(module.requires ?? []), ...(module.uses ?? [])].find(
        (id) => !byId.has(id),
      );
      if (!missing) continue;
      drop(module, `The module "${module.id}" requires "${missing}", which isn't loaded.`);
      changed = true;
    }
  }
}

function dependencies(module: AppModule, byId: ReadonlyMap<string, AppModule>): AppModule[] {
  return [...(module.requires ?? []), ...(module.after ?? [])].flatMap((id) => {
    const dependency = byId.get(id);
    return dependency ? [dependency] : [];
  });
}

/** The ids of a dependency loop (first id repeated at the end), or `null` if there's none. */
function findCycle(
  modules: readonly AppModule[],
  byId: ReadonlyMap<string, AppModule>,
): string[] | null {
  const state = new Map<string, "visiting" | "done">();
  const visit = (module: AppModule, path: string[]): string[] | null => {
    const seen = state.get(module.id);
    if (seen === "done") return null;
    if (seen === "visiting") return [...path.slice(path.indexOf(module.id)), module.id];
    state.set(module.id, "visiting");
    for (const dependency of dependencies(module, byId)) {
      const cycle = visit(dependency, [...path, module.id]);
      if (cycle) return cycle;
    }
    state.set(module.id, "done");
    return null;
  };
  for (const module of modules) {
    const cycle = visit(module, []);
    if (cycle) return cycle;
  }
  return null;
}

/** Depth-first order of a loop-free graph: each module after its dependencies. */
function order(modules: readonly AppModule[], byId: ReadonlyMap<string, AppModule>): AppModule[] {
  const sorted: AppModule[] = [];
  const done = new Set<string>();
  const visit = (module: AppModule) => {
    if (done.has(module.id)) return;
    done.add(module.id);
    for (const dependency of dependencies(module, byId)) visit(dependency);
    sorted.push(module);
  };
  for (const module of modules) visit(module);
  return sorted;
}
