import { useId, useState } from "react";
import { FolderOpen, Trash2 } from "lucide-react";

import { Badge } from "@shared/ui/components/ui/badge";
import { Button } from "@shared/ui/components/ui/button";
import { Switch } from "@shared/ui/components/ui/switch";
import type { PluginRowProps } from "./plugins.types";

/** One installed plugin: what it is, whether it runs, and what happened when it loaded. */
export function PluginRow({
  plugin,
  status,
  enabled,
  onToggle,
  onRemove,
  onReveal,
}: PluginRowProps) {
  const { manifest, source } = plugin;
  const switchId = useId();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-2 border-t pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor={switchId} className="text-sm font-medium">
              {manifest.name}
            </label>
            <span className="text-xs text-muted-foreground">
              {manifest.version}
              {manifest.author ? ` · ${manifest.author}` : ""}
            </span>
            {source === "linked" && <Badge variant="outline">Development</Badge>}
            {status?.state === "failed" && <Badge variant="destructive">Failed</Badge>}
          </div>
          {manifest.description && (
            <p className="text-sm text-muted-foreground">{manifest.description}</p>
          )}
          {status?.state === "enabled" && (!!status.stickers || !!status.themes) && (
            <p className="text-xs text-muted-foreground">
              Adds{" "}
              {[
                status.stickers &&
                  `${status.stickers} ${status.stickers === 1 ? "sticker" : "stickers"}`,
                status.themes && `${status.themes} ${status.themes === 1 ? "theme" : "themes"}`,
              ]
                .filter(Boolean)
                .join(" and ")}
            </p>
          )}
          {status?.state === "failed" && status.error && (
            <p className="text-sm break-words text-destructive">{status.error}</p>
          )}
        </div>
        <Switch id={switchId} checked={enabled} onCheckedChange={onToggle} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onReveal}>
          <FolderOpen />
          Show folder
        </Button>
        {confirming ? (
          <>
            <span className="text-sm">
              {source === "linked" ? "Stop loading it? Its folder stays." : "Delete it?"}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirming(false);
                onRemove();
              }}
            >
              Remove
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => setConfirming(true)}
          >
            <Trash2 />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
