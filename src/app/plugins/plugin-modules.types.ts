import type { AppModule } from "@shared/core";
import type { PluginStickerStage } from "./plugin-stickers.types";

/** The products plugins can extend. */
export type PluginProduct = "board" | "design";

/** A plugin's modules for each product it extends. */
export type PluginModules = Record<PluginProduct, AppModule[]>;

/** A plugin once its code ran: its modules and what it staged for the sticker catalog. */
export interface ImportedPlugin {
  modules: PluginModules;
  stickers: PluginStickerStage;
}
