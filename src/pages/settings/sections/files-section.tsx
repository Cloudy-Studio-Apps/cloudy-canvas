import { useEffect, useId, useState } from "react";
import { Copy, FolderOpen, Trash2 } from "lucide-react";

import { clipboard, revealFile, storage } from "@platform";
import { tCommon } from "@shared/core";
import { useAutosaveStore } from "@shared/stores/autosave-store";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import { Button } from "@shared/ui/components/ui/button";
import { Switch } from "@shared/ui/components/ui/switch";
import { SettingsSection } from "../components/settings-section";
import { t } from "../settings.i18n";

export function FilesSection() {
  const count = useRecentFilesStore((s) => s.files.length);
  const refresh = useRecentFilesStore((s) => s.refresh);
  const clear = useRecentFilesStore((s) => s.clear);
  const [location, setLocation] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const autosave = useAutosaveStore((s) => s.enabled);
  const setAutosave = useAutosaveStore((s) => s.setEnabled);
  const autosaveId = useId();

  useEffect(() => {
    void refresh();
    void storage.indexLocation().then(setLocation);
  }, [refresh]);

  const copyLocation = (path: string) =>
    void clipboard.writeText(path).then(
      () => toast({ title: t("files.pathCopied"), description: path }),
      (error: unknown) => notifyError(t("errors.copyFailed"), error),
    );
  const showLocation = (path: string) =>
    void revealFile(path).catch((error: unknown) => notifyError(t("errors.folderFailed"), error));

  return (
    <SettingsSection id="files" title={t("nav.files")} description={t("files.description")}>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <label htmlFor={autosaveId} className="text-sm font-medium">
              {t("files.autosave")}
            </label>
            <p className="text-sm text-muted-foreground">{t("files.autosaveHint")}</p>
          </div>
          <Switch id={autosaveId} checked={autosave} onCheckedChange={setAutosave} />
        </div>
        <div className="space-y-1.5 border-t pt-4">
          <p className="text-sm font-medium">{t("files.recentList")}</p>
          {location ? (
            <>
              <p className="rounded-md border bg-surface-sunken px-2.5 py-2 font-mono text-xs break-all text-muted-foreground">
                {location}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => showLocation(location)}>
                  <FolderOpen />
                  {t("files.showInFolder")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => copyLocation(location)}>
                  <Copy />
                  {t("files.copyPath")}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t("files.desktopOnly")}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{t("files.recentCount", { count })}</p>
            <p className="text-sm text-muted-foreground">{t("files.clearHint")}</p>
          </div>
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">{t("files.confirmClear", { count })}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setConfirming(false);
                  void clear();
                }}
              >
                {t("files.clear")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                {tCommon("cancel")}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={count === 0}
              onClick={() => setConfirming(true)}
              className="text-destructive"
            >
              <Trash2 />
              {t("files.clearAll")}
            </Button>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}
