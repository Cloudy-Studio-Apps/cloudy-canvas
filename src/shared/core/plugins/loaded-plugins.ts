import type { LoadedPlugin, LoadedPlugins } from "./loaded-plugins.types";

const plugins = new Map<string, LoadedPlugin>();

/**
 * The plugins that loaded, with their modules and (for the board's HTML export) their code when
 * they draw in the viewer. Filled by the plugin loader once a plugin's modules registered.
 */
export const loadedPlugins: LoadedPlugins = {
  set: (plugin) => void plugins.set(plugin.id, plugin),
  get: (id) => plugins.get(id),
  all: () => [...plugins.values()],
  ownerOf: (moduleId) => [...plugins.values()].find((p) => p.modules.includes(moduleId)),
  drop: (id) => void plugins.delete(id),
};
