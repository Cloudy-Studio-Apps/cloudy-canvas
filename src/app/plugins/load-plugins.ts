import { pluginStorage } from "@platform";
import type { PluginStatus } from "@shared/core";
import { usePluginsStore } from "@shared/stores/plugins-store";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "../app.i18n";

/**
 * Finds the installed plugins and loads the enabled (and trusted) ones, registering their
 * modules. Runs once, before the app renders, so the board's and design's modules include them;
 * only then are the products needed this early. Never throws: a plugin that fails is marked as
 * failed and the others still load.
 */
export async function loadPlugins(): Promise<void> {
  const { enabled, trusted } = usePluginsStore.getState();
  let scan;
  try {
    scan = await pluginStorage.list();
  } catch (error) {
    notifyError(t("plugins.readFailed"), error);
    return;
  }

  const statuses: Record<string, PluginStatus> = {};
  for (const plugin of scan.plugins) {
    const { id } = plugin.manifest;
    if (enabled.includes(id) && trusted.includes(id)) {
      const { activatePlugin } = await import("./activate-plugin");
      statuses[id] = await activatePlugin(plugin);
    } else {
      statuses[id] = { id, state: "disabled", modules: [] };
    }
  }
  usePluginsStore.getState().setLoaded({ installed: scan.plugins, broken: scan.broken, statuses });
}
