import type { BrokenPluginRowProps } from "./plugins.types";
import { RemovePluginButton } from "./remove-plugin-button";

/** A folder that couldn't be read as a plugin: where it is, why, and Remove. */
export function BrokenPluginRow({ plugin, onRemove }: BrokenPluginRowProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm break-words text-muted-foreground">
        <span className="font-mono text-xs">{plugin.path}</span>: {plugin.error}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <RemovePluginButton source={plugin.source} onRemove={onRemove} />
      </div>
    </div>
  );
}
