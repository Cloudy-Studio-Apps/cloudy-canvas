import { useState } from "react";
import { FolderOpen, FolderPlus, Code, RotateCw } from "lucide-react";

import type { InstalledPlugin } from "@shared/core";
import { usePluginsStore } from "@shared/stores/plugins-store";
import { Button } from "@shared/ui/components/ui/button";
import { SettingsSection } from "../../components/settings-section";
import { PluginRow } from "./plugin-row";
import { PluginTrustDialog } from "./plugin-trust-dialog";
import { usePluginActions } from "./use-plugin-actions";

export function PluginsSection() {
  const installed = usePluginsStore((s) => s.installed);
  const broken = usePluginsStore((s) => s.broken);
  const statuses = usePluginsStore((s) => s.statuses);
  const enabled = usePluginsStore((s) => s.enabled);
  const trusted = usePluginsStore((s) => s.trusted);
  const needsReload = usePluginsStore((s) => s.needsReload);
  const setEnabled = usePluginsStore((s) => s.setEnabled);
  const trust = usePluginsStore((s) => s.trust);
  const actions = usePluginActions();
  const [asking, setAsking] = useState<InstalledPlugin | null>(null);

  const toggle = (plugin: InstalledPlugin, on: boolean) => {
    if (on && !trusted.includes(plugin.manifest.id)) setAsking(plugin);
    else setEnabled(plugin.manifest.id, on);
  };

  return (
    <SettingsSection
      id="plugins"
      title="Plugins"
      description="Add tools, elements and agent tools to your boards. Changes apply after a reload."
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={actions.install}>
            <FolderPlus />
            Install from folder…
          </Button>
          <Button variant="ghost" size="sm" onClick={actions.link}>
            <Code />
            Add folder for development…
          </Button>
          <Button variant="ghost" size="sm" onClick={actions.showFolder}>
            <FolderOpen />
            Show plugins folder
          </Button>
        </div>

        {needsReload && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-surface-sunken px-3 py-2">
            <p className="text-sm">Reload the app to apply the changes to plugins.</p>
            <Button size="sm" onClick={() => location.reload()}>
              <RotateCw />
              Reload
            </Button>
          </div>
        )}

        {installed.length === 0 ? (
          <p className="text-sm text-muted-foreground">No plugins installed.</p>
        ) : (
          <div className="space-y-4">
            {installed.map((plugin) => (
              <PluginRow
                key={plugin.manifest.id}
                plugin={plugin}
                status={statuses[plugin.manifest.id]}
                enabled={enabled.includes(plugin.manifest.id)}
                onToggle={(on) => toggle(plugin, on)}
                onRemove={() => actions.remove(plugin)}
                onReveal={() => actions.reveal(plugin.path)}
              />
            ))}
          </div>
        )}

        {broken.length > 0 && (
          <div className="space-y-1.5 border-t pt-4">
            <p className="text-sm font-medium">Folders that couldn&apos;t be read</p>
            {broken.map(({ path, error }) => (
              <p key={path} className="text-sm break-words text-muted-foreground">
                <span className="font-mono text-xs">{path}</span>: {error}
              </p>
            ))}
          </div>
        )}
      </div>
      <PluginTrustDialog
        plugin={asking}
        onCancel={() => setAsking(null)}
        onTrust={() => {
          if (asking) {
            trust(asking.manifest.id);
            setEnabled(asking.manifest.id, true);
          }
          setAsking(null);
        }}
      />
    </SettingsSection>
  );
}
