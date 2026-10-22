import type { AppModule } from "@shared/core";

/** The products plugins can extend. */
export type PluginProduct = "board" | "design";

/** A plugin's modules for each product it extends. */
export type PluginModules = Record<PluginProduct, AppModule[]>;
