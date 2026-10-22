import { pluginStorage } from "@platform";
import type { AppModule, InstalledPlugin } from "@shared/core";
import { createPluginApi } from "./create-plugin-api";

/**
 * Runs a plugin's code and returns its modules. The code is one ES module, imported from a
 * `blob:` URL; its default export is `activate(api)`, which returns a module or a list of them.
 * Throws with a message for the user when the plugin doesn't follow the format.
 */
export async function importPlugin(plugin: InstalledPlugin): Promise<AppModule[]> {
  const code = await pluginStorage.readMain(plugin);
  const url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
  let exports: { default?: unknown };
  try {
    exports = (await import(/* @vite-ignore */ url)) as { default?: unknown };
  } finally {
    URL.revokeObjectURL(url);
  }
  if (typeof exports.default !== "function") {
    throw new Error(`${plugin.manifest.main} has no default export activate(api).`);
  }
  const result: unknown = await (exports.default as (api: unknown) => unknown)(
    createPluginApi(plugin),
  );
  const modules = Array.isArray(result) ? (result as unknown[]) : [result];
  return modules.map((module) => checkModule(plugin.manifest.id, module));
}

function checkModule(pluginId: string, value: unknown): AppModule {
  const module = value as Partial<AppModule> | null;
  if (typeof module?.id !== "string" || typeof module.register !== "function") {
    throw new Error("activate(api) must return modules made with api.core.defineModule.");
  }
  if (module.id !== pluginId && !module.id.startsWith(`${pluginId}.`)) {
    throw new Error(`The module "${module.id}" must be named "${pluginId}" or "${pluginId}.…".`);
  }
  return module as AppModule;
}
