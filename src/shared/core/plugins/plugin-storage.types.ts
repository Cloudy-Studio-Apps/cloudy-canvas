import type { InstalledPlugin, PluginScan } from "./plugin.types";

/** The user's plugins on disk, implemented per platform (`pluginStorage` in `@platform`). */
export interface PluginStorage {
  list(): Promise<PluginScan>;
  /** The plugin's code (its manifest's `main`). */
  readMain(plugin: InstalledPlugin): Promise<string>;
  /** A file in the plugin's folder; `path` is relative to it and can't leave it. */
  readAsset(plugin: InstalledPlugin, path: string): Promise<Uint8Array>;
  /** Copies a plugin folder into the app's plugins, replacing an older copy of it. */
  installFromFolder(path: string): Promise<InstalledPlugin>;
  /** Loads a plugin from its own folder on every start (for developing one). */
  link(path: string): Promise<InstalledPlugin>;
  /**
   * Deletes a copied plugin, or forgets a linked one (its folder is left alone); a plugin that
   * couldn't be read too (`BrokenPlugin`), e.g. a development folder that was deleted.
   */
  remove(plugin: Pick<InstalledPlugin, "source" | "path">): Promise<void>;
  /** The folder copied plugins live in, or `null` where there's none (the browser). */
  folder(): Promise<string | null>;
}
