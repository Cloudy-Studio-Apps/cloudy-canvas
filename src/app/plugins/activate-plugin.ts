import { registerBoardModule } from "@board/ui";
import { registerDesignModule } from "@design/ui";
import { loadedPlugins, stickerCatalog, themeRegistry } from "@shared/core";
import type { InstalledPlugin, PluginStatus } from "@shared/core";
import { importPlugin } from "./import-plugin";

/** How long a plugin's code may take to load before it's left out. */
const LOAD_TIMEOUT_MS = 5000;

/**
 * Runs an enabled plugin and registers its modules. Imported only when one is enabled: the plugin
 * API holds both products, which the app otherwise loads after its first page.
 */
export async function activatePlugin(plugin: InstalledPlugin): Promise<PluginStatus> {
  const { id } = plugin.manifest;
  try {
    const imported = await withTimeout(importPlugin(plugin), LOAD_TIMEOUT_MS);
    const { board, design } = imported.modules;
    const stickers = imported.stickers.commit();
    let themes = 0;
    try {
      themes = imported.themes.commit();
      for (const module of board) registerBoardModule(module, { plugin: id });
      for (const module of design) registerDesignModule(module, { plugin: id });
    } catch (error) {
      stickerCatalog.drop(id);
      themeRegistry.drop(id);
      throw error;
    }
    const modules = [...new Set([...board, ...design].map((module) => module.id))];
    loadedPlugins.set({ id, name: plugin.manifest.name, modules, viewerCode: imported.viewerCode });
    return { id, state: "enabled", modules, stickers, themes };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[plugins] "${id}" couldn't be loaded:`, error);
    return { id, state: "failed", error: message, modules: [] };
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`It took more than ${ms / 1000} s to load.`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}
