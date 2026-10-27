import type { BrokenPlugin, InstalledPlugin, PluginStatus } from "@shared/core";

export interface PluginRowProps {
  plugin: InstalledPlugin;
  status: PluginStatus | undefined;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onRemove: () => void;
  onReveal: () => void;
}

export interface RemovePluginButtonProps {
  /** A linked plugin is only forgotten (its folder stays); a copied one is deleted. */
  source: InstalledPlugin["source"];
  onRemove: () => void;
}

export interface BrokenPluginRowProps {
  plugin: BrokenPlugin;
  onRemove: () => void;
}

export interface PluginTrustDialogProps {
  /** The plugin asking to be trusted, or `null` when the dialog is closed. */
  plugin: InstalledPlugin | null;
  onTrust: () => void;
  onCancel: () => void;
}

export interface PluginActions {
  install: () => void;
  link: () => void;
  remove: (plugin: InstalledPlugin) => void;
  /** Forgets a development folder that couldn't be read, or deletes a broken copy. */
  removeBroken: (plugin: BrokenPlugin) => void;
  reveal: (path: string) => void;
  showFolder: () => void;
}
