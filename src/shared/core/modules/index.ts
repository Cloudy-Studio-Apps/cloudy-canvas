// Modules: features plug into the app through typed extension points (see CLAUDE.md, Modules).
export type * from "./modules.types";
export { defineModule } from "./define-module";
export { definePoint } from "./define-point";
export { createModuleHost } from "./module-host";
export { sortModules } from "./sort-modules";
