/** A plugin that loaded, as the rest of the app may ask about it (see `loadedPlugins`). */
export interface LoadedPlugin {
  id: string;
  name: string;
  /** The ids of the modules it registered. */
  modules: readonly string[];
  /**
   * Its `main.js` when it also exports `activateViewer(api)`, so the board's HTML export copies it
   * into the file and its elements draw there; `null` otherwise.
   */
  viewerCode: string | null;
}

/** The plugins that loaded this session, by plugin id. */
export interface LoadedPlugins {
  set(plugin: LoadedPlugin): void;
  get(id: string): LoadedPlugin | undefined;
  /** Every loaded plugin, in load order. */
  all(): LoadedPlugin[];
  /** The plugin that registered a module, if a plugin did. */
  ownerOf(moduleId: string): LoadedPlugin | undefined;
  /** Forgets a plugin (it failed, or a product left it out). */
  drop(id: string): void;
}
