import type { BrokenPlugin, InstalledPlugin, PluginStatus } from "@shared/core";

export interface PluginsState {
  /** Plugins that load when the app starts (saved). New plugins start disabled. */
  enabled: string[];
  /** Plugins the user agreed to run with the app's access (saved). */
  trusted: string[];
  /** What the app found and loaded when it started (not saved). */
  installed: InstalledPlugin[];
  broken: BrokenPlugin[];
  statuses: Record<string, PluginStatus>;
  /** Something changed that only applies after a reload. */
  needsReload: boolean;
  setEnabled: (id: string, enabled: boolean) => void;
  trust: (id: string) => void;
  /** Records what the loader found and did. */
  setLoaded: (loaded: Pick<PluginsState, "installed" | "broken" | "statuses">) => void;
  setStatus: (status: PluginStatus) => void;
  markNeedsReload: () => void;
}
