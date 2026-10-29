/** A plugin's code as the board's HTML export copies it into the file (see `pluginViewerSources`). */
export interface PluginViewerSource {
  /** The plugin's name, as the viewer's placeholders would show it. */
  name: string;
  /** Its `main.js`, which exports `activateViewer(api)` next to `activate`. */
  code: string;
}

/** The loaded plugins that draw in the board's HTML viewer, by plugin id. */
export interface PluginViewerSources {
  set(id: string, source: PluginViewerSource): void;
  get(id: string): PluginViewerSource | undefined;
  /** Forgets a plugin (it failed, or the board left it out). */
  drop(id: string): void;
}
