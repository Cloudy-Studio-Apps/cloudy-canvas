import { registerBoardModule } from "@board/ui";
import { registerDesignModule } from "@design/ui";
import { pluginStorage } from "@platform";
import {
  stickerCatalog,
  themeRegistry,
  type InstalledPlugin,
  type PluginStatus,
} from "@shared/core";
import { usePluginsStore } from "@shared/stores/plugins-store";
import { notifyError } from "@shared/stores/toast-store";
import { importPlugin } from "./import-plugin";
import { t } from "../app.i18n";

/** How long a plugin's code may take to load before it's left out. */
const LOAD_TIMEOUT_MS = 5000;

/**
 * Finds the installed plugins and loads the enabled (and trusted) ones, registering their
 * modules. Runs once, before the app renders, so the board's and design's modules include them.
 * Never throws:
 * a plugin that fails is marked as failed and the others still load.
 */
export async function loadPlugins(): Promise<void> {
  const store = usePluginsStore.getState();
  let scan;
  try {
    scan = await pluginStorage.list();
  } catch (error) {
    notifyError(t("plugins.readFailed"), error);
    return;
  }

  const statuses: Record<string, PluginStatus> = {};
  for (const plugin of scan.plugins) {
    statuses[plugin.manifest.id] = await loadPlugin(plugin, store);
  }
  usePluginsStore.getState().setLoaded({ installed: scan.plugins, broken: scan.broken, statuses });
}

async function loadPlugin(
  plugin: InstalledPlugin,
  { enabled, trusted }: { enabled: string[]; trusted: string[] },
): Promise<PluginStatus> {
  const { id } = plugin.manifest;
  if (!enabled.includes(id) || !trusted.includes(id)) return { id, state: "disabled", modules: [] };
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
