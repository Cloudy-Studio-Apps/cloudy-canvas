import { pluginStorage } from "@platform";
import type { AppModule, InstalledPlugin } from "@shared/core";
import { createPluginApi } from "./create-plugin-api";
import { createPluginStickers } from "./plugin-stickers";
import { createPluginThemes } from "./plugin-themes";
import type { ImportedPlugin, PluginModules, PluginProduct } from "./plugin-modules.types";

const PRODUCTS: readonly PluginProduct[] = ["board", "design"];

/**
 * Runs a plugin's code and returns its modules for each product. The code is one ES module,
 * imported from a `blob:` URL; its default export is `activate(api)`, which returns a module or a
 * list of them (for the one product in its manifest's `products`), or `{ board, design }` with a
 * list for each; a plugin that only adds stickers or themes may return nothing. What it gave
 * `api.stickers` and `api.themes` comes back staged, to commit once it's loaded. Throws
 * with a message for the user when the plugin doesn't follow the format.
 */
export async function importPlugin(plugin: InstalledPlugin): Promise<ImportedPlugin> {
  const code = await pluginStorage.readMain(plugin);
  const url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
  let exports: { default?: unknown; activateViewer?: unknown };
  try {
    exports = (await import(/* @vite-ignore */ url)) as typeof exports;
  } finally {
    URL.revokeObjectURL(url);
  }
  if (typeof exports.default !== "function") {
    throw new Error(`${plugin.manifest.main} has no default export activate(api).`);
  }
  const stickers = createPluginStickers(plugin.manifest.id);
  const themes = createPluginThemes(plugin.manifest.id);
  const result: unknown = await (exports.default as (api: unknown) => unknown)(
    createPluginApi(plugin, { stickers: stickers.api, themes: themes.api }),
  );
  const viewerCode = typeof exports.activateViewer === "function" ? code : null;
  return { modules: splitByProduct(plugin, result), stickers, themes, viewerCode };
}

function splitByProduct(plugin: InstalledPlugin, result: unknown): PluginModules {
  const { id, products } = plugin.manifest;
  const list = (value: unknown) =>
    (Array.isArray(value) ? (value as unknown[]) : value === undefined ? [] : [value]).map(
      (module) => checkModule(id, module),
    );
  const byProduct = result as Partial<Record<PluginProduct, unknown>> | null;
  const split =
    byProduct && !Array.isArray(result) && PRODUCTS.some((product) => product in byProduct);
  if (split) {
    const modules = { board: list(byProduct.board), design: list(byProduct.design) };
    for (const product of PRODUCTS) {
      if (modules[product].length > 0 && !products.includes(product)) {
        throw new Error(`It has ${product} modules, but "${product}" isn't in its products.`);
      }
    }
    return modules;
  }
  if (result === undefined) return { board: [], design: [] };
  const targets = PRODUCTS.filter((product) => products.includes(product));
  const [target] = targets;
  if (!target || targets.length > 1) {
    throw new Error(
      targets.length > 1
        ? "activate(api) must return { board: [...], design: [...] } for a plugin of both products."
        : `Its products must include "board" or "design".`,
    );
  }
  return { board: [], design: [], [target]: list(result) };
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
