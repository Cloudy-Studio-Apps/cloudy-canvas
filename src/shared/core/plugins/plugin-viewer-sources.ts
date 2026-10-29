import type { PluginViewerSource, PluginViewerSources } from "./plugin-viewer-sources.types";

const sources = new Map<string, PluginViewerSource>();

/**
 * The loaded plugins whose `main.js` also exports `activateViewer(api)`: the board's HTML export
 * copies their code into the file so their elements draw there. Filled when plugins load.
 */
export const pluginViewerSources: PluginViewerSources = {
  set: (id, source) => void sources.set(id, source),
  get: (id) => sources.get(id),
  drop: (id) => void sources.delete(id),
};
