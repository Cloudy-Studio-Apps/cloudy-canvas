import type { AppModule } from "./modules.types";

/**
 * The modules in an order where each comes after the ones it `requires` or is `after`, keeping
 * the given order otherwise. Throws on duplicate ids, missing requirements and cycles.
 */
export function sortModules(modules: readonly AppModule[]): AppModule[] {
  const byId = new Map<string, AppModule>();
  for (const module of modules) {
    if (byId.has(module.id)) throw new Error(`The module "${module.id}" is loaded twice.`);
    byId.set(module.id, module);
  }
  for (const module of modules) {
    const missing = module.requires?.find((id) => !byId.has(id));
    if (missing)
      throw new Error(`The module "${module.id}" requires "${missing}", which isn't loaded.`);
  }

  const sorted: AppModule[] = [];
  const state = new Map<string, "visiting" | "done">();
  const visit = (module: AppModule, path: readonly string[]) => {
    const seen = state.get(module.id);
    if (seen === "done") return;
    if (seen === "visiting") {
      throw new Error(
        `Modules depend on each other in a loop: ${[...path, module.id].join(" → ")}.`,
      );
    }
    state.set(module.id, "visiting");
    for (const id of [...(module.requires ?? []), ...(module.after ?? [])]) {
      const dependency = byId.get(id);
      if (dependency) visit(dependency, [...path, module.id]);
    }
    state.set(module.id, "done");
    sorted.push(module);
  };
  for (const module of modules) visit(module, []);
  return sorted;
}
