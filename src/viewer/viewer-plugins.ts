import type { ViewerPlugin } from "@board/modules/viewer";
import type { AppModule } from "@shared/core";
import { createViewerPluginApi } from "./viewer-plugin-api";
import type { ViewerPluginModules } from "./viewer-plugins.types";

/**
 * Runs each plugin's code the file carries (from a `blob:` URL, as the app does) and collects
 * the board modules its `activateViewer(api)` returns. A plugin that fails is left out.
 */
export async function activateViewerPlugins(
  plugins: readonly ViewerPlugin[],
): Promise<ViewerPluginModules> {
  const modules: AppModule[] = [];
  const failed = new Set<string>();
  for (const plugin of plugins) {
    const url = URL.createObjectURL(new Blob([plugin.code], { type: "text/javascript" }));
    try {
      const exports = (await import(/* @vite-ignore */ url)) as { activateViewer?: unknown };
      if (typeof exports.activateViewer !== "function") throw new Error("No activateViewer(api).");
      const result: unknown = await (exports.activateViewer as (api: unknown) => unknown)(
        createViewerPluginApi(plugin),
      );
      const list = (Array.isArray(result) ? result : [result]) as Partial<AppModule>[];
      for (const module of list) {
        const ok = typeof module.id === "string" && typeof module.register === "function";
        if (!ok || !(module.id === plugin.id || module.id!.startsWith(`${plugin.id}.`))) {
          throw new Error("activateViewer(api) must return the plugin's modules.");
        }
      }
      modules.push(...(list as AppModule[]));
    } catch (error) {
      console.error(`[viewer] The plugin "${plugin.id}" couldn't start:`, error);
      failed.add(plugin.id);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return { modules, failed };
}
