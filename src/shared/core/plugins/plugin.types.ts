/** `plugin.json`: what a plugin folder holds and what it needs. */
export interface PluginManifest {
  /** Unique, lowercase letters, digits and dashes (e.g. `"callout"`). Module ids start with it. */
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  /** The plugin API it was written for (see `PLUGIN_API_VERSION`). */
  apiVersion: number;
  /** The products it extends, e.g. `["board"]`. */
  products: string[];
  /** Its code: one ES module, relative to the folder (e.g. `"main.js"`). */
  main: string;
}

/** A plugin found on disk. */
export interface InstalledPlugin {
  manifest: PluginManifest;
  /** Copied into the app data folder, or loaded from a folder the user picked (development). */
  source: "copied" | "linked";
  /** Its folder. */
  path: string;
}

/** A folder that looks like a plugin but can't be loaded (no or invalid `plugin.json`, …). */
export interface BrokenPlugin {
  path: string;
  error: string;
}

/** What `PluginStorage.list` found. */
export interface PluginScan {
  plugins: InstalledPlugin[];
  broken: BrokenPlugin[];
}

/** What happened to a plugin when the app started. */
export interface PluginStatus {
  id: string;
  state: "enabled" | "disabled" | "failed";
  /** Why it failed. */
  error?: string;
  /** The modules it registered (when enabled). */
  modules: string[];
}
