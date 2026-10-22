import type { InstalledPlugin, PluginStatus } from "@shared/core";

export interface PluginRowProps {
  plugin: InstalledPlugin;
  status: PluginStatus | undefined;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onRemove: () => void;
  onReveal: () => void;
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
  reveal: (path: string) => void;
  showFolder: () => void;
}
