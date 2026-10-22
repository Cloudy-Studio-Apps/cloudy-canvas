import type { AppModule } from "./modules.types";

/** Declares a module (only types it; modules are loaded with `createModuleHost`). */
export function defineModule(module: AppModule): AppModule {
  return module;
}
