import { useId, useState } from "react";
import { FolderOpen, Trash2 } from "lucide-react";

import { getLocale, tCommon } from "@shared/core";
import { Badge } from "@shared/ui/components/ui/badge";
import { Button } from "@shared/ui/components/ui/button";
import { Switch } from "@shared/ui/components/ui/switch";
import type { PluginRowProps } from "./plugins.types";
import { t } from "../../settings.i18n";

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
            {source === "linked" && <Badge variant="outline">{t("plugins.development")}</Badge>}
            {status?.state === "failed" && (
              <Badge variant="destructive">{t("plugins.failed")}</Badge>
            )}
          </div>
          {manifest.description && (
            <p className="text-sm text-muted-foreground">{manifest.description}</p>
          )}
          {status?.state === "enabled" && (!!status.stickers || !!status.themes) && (
            <p className="text-xs text-muted-foreground">
              {t("plugins.adds", {
                items: new Intl.ListFormat(getLocale(), { type: "conjunction" }).format(
                  [
                    status.stickers && t("plugins.addsStickers", { count: status.stickers }),
                    status.themes && t("plugins.addsThemes", { count: status.themes }),
                  ].filter((item): item is string => !!item),
                ),
              })}
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
          {t("plugins.show")}
        </Button>
        {confirming ? (
          <>
            <span className="text-sm">
              {source === "linked" ? t("plugins.stopLoading") : t("plugins.deleteIt")}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirming(false);
                onRemove();
              }}
            >
              {t("plugins.remove")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              {tCommon("cancel")}
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
            {t("plugins.remove")}
          </Button>
        )}
      </div>
    </div>
  );
}
